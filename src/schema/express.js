'use strict';

module.exports = schema_express;

var mongoosemask = require('mongoosemask');
var j = require('path').join;
var schema_utils = require('./utils.js');

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

  meta.$express.restricted_filter = function restricted_filter(log, user, method, input) {
    // restricted: true
    var output = input;

    var blacklist2 = [];

    schema_utils.each_path(meta, function(path, options) {
      var ref = options.options.restricted[method];
      if (ref === false) {
        return;
      }

      if (ref === true || !user.has_permission(ref)) {
        blacklist2.push(path);
      }
    });

    if (blacklist2.length) {
      log.silly('restricted fields', blacklist2);
      return mongoosemask.mask(output, blacklist2);
    }

    return output;
  };

  meta.$express.formatter = function formatter_db(req, output, cb) {
    delete output.__v;

    // restricted: true | {create,read,update}
    output = meta.$express.restricted_filter(req.log, req.user, 'read', output);

    if (formatter) {
      return formatter(req, 'read', output, cb);
    }

    cb(null, output);
  };
}
