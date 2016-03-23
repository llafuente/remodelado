'use strict';

module.exports = schema_express;

var mongoosemask = require('mongoosemask');
var j = require('path').join;

function schema_express(meta) {
  meta.express = meta.express || {};

  meta.backend.prefix = meta.backend.prefix || '';

  // url staff
  var id_param = `${meta.singular}_id`;
  meta.$express = {
    id_param: id_param,
    urls: {
      list: j('/', meta.backend.prefix, meta.plural),
      create: j('/', meta.backend.prefix, meta.plural),
      read: j('/', meta.backend.prefix, meta.plural + '/:' + id_param),
      update: j('/', meta.backend.prefix, meta.plural + '/:' + id_param),
      delete: j('/', meta.backend.prefix, meta.plural + '/:' + id_param),
    },
    permissions: {
      list: `permission-${meta.plural}-list`,
      create: `permission-${meta.plural}-create`,
      read: `permission-${meta.plural}-read`,
      update: `permission-${meta.plural}-update`,
      delete: `permission-${meta.plural}-delete`,
    }
  };

  // common cleanup before send
  var blacklist = [];

  meta.$schema.eachPath(function(path, options) {
    if (options.options.restricted === true) {
      blacklist.push(path);
    }
  });

  // use the user one after our common clean up
  // rename _id -> id
  // remove __v
  // remove restricted
  var before_send = meta.express.before_send;

  meta.$express.restricted_filter = function restricted_filter(user, method, input) {
    // restricted: true
    var output = input;
    if ("read" === method && blacklist.length) {
      output = mongoosemask.mask(input, blacklist);
    }

    var blacklist2 = [];

    meta.$schema.eachPath(function(path, options) {
      if (options.options.restricted !== undefined && options.options.restricted !== true) {
        if (options.options.restricted[method] === false) {
          return;
        }

        if (options.options.restricted[method] === true || !user.has_permission(options.options.restricted[method])) {
          blacklist2.push(path);
        }
      }
    });
    if (blacklist2.length) {
      return mongoosemask.mask(output, blacklist2);
    }

    return output;
  }

  meta.$express.before_send = function before_send_cb(req, method, output, cb) {
    switch (method) {
    case 'update':
    case 'create':
    case 'read':
      // TODO remove and use an autoincrement
      output.id = output._id;
      delete output._id;
      delete output.__v;
      break;
    case 'list':
      // TODO review if mongoosemask.mask works with arrays...
      var i;
      for (i = 0; i < output.length; ++i) {
        output[i].id = output[i]._id;
        delete output[i] ._id;
        delete output[i].__v;
      }
    }

    // restricted: true | {create,read,update}
    output = meta.$express.restricted_filter(req.user, "read", output);

    if (before_send) {
      return before_send(req, method, output, cb);
    }

    cb(null, output);
  };
}
