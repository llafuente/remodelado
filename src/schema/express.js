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
    },
    blacklisted: {
      create: [],
      update: []
    }
  };

  // use the user one after our common clean up
  // rename _id -> id
  // remove __v
  // remove restricted
  var formatter = meta.backend.format;

  meta.$express.restricted_filter = function restricted_filter(user, method, input) {
    // restricted: true
    var output = input;

    var blacklist2 = [];

    meta.$schema.eachPath(function(path, options) {
      var ref = options.options.restricted[method];
      if (ref === false) {
        return;
      }

      if (ref === true || !user.has_permission(ref)) {
        blacklist2.push(path);
      }
    });
    console.log(output);
    if (blacklist2.length) {
      return mongoosemask.mask(output, blacklist2);
    }

    return output;
  };

  meta.$express.formatter = function formatter_db(req, output, cb) {
    // TODO remove and use an autoincrement
    output.id = output._id;
    delete output._id;
    delete output.__v;

    // restricted: true | {create,read,update}
    output = meta.$express.restricted_filter(req.user, 'read', output);

    if (formatter) {
      return formatter(req, method, output, cb);
    }

    cb(null, output);
  };

  meta.$init.push(function create_blacklist() {
    meta.$schema.eachPath(function(path, options) {
      if (options.options.create === false) {
        meta.$express.blacklisted.create.push(path);
      }
    });
  });

  meta.$init.push(function update_blacklist() {
    meta.$schema.eachPath(function(path, options) {
      if (options.options.update === false) {
        meta.$express.blacklisted.update.push(path);
      }
    });
  });
}
