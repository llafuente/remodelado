'use strict';

module.exports = schema_default;

var _ = require('lodash');
var pluralize = require('pluralize');
var _async = require('async');
var utils = require('./utils.js');

var default_schema = {
  type: 'String',
  restricted: {
    create: false,
    update: false,
    read: false
  }
};

function schema_default(meta) {
  utils.loop(meta.backend.schema, function(field, path, obj, prop) {
    $log.silly(`set defaults ${meta.singular} ${path}`);
    var o;
    switch(field.type) {
      case "String":
      case "Number":
      case "ObjectId":
      case "Mixed":
        obj[prop] = o = _.defaults(field, default_schema);
      break;
      default:
        return;
    }

    // shortcut: can update/create cant read
    if (o.restricted === true) {
      o.restricted = {
        create: false,
        update: false,
        read: true
      };
    }

    // shortcut: can update/create/read
    if (o.restricted === false) {
      o.restricted = {
        create: false,
        update: false,
        read: false
      };
    }
  });

  meta.backend.schema.id = {
    type: "Number",
    restricted: {read: false, create: true, update: true}
  };

  meta.backend.schema.created_at = {
    type: "Date",
    restricted: {read: false, create: true, update: true}
  };

  meta.backend.schema.updated_at = {
    type: "Date",
    restricted: {read: false, create: true, update: true}
  };

  meta.backend.schema.id = {
    type: 'Number',
    restricted: {read: false, create: true, update: true}
  };

  // NOTE __v need to be manually declared, or wont be in the paths
  meta.backend.schema.__v = {
    type: 'Number',
    select: false,
    restricted: {read: true, create: true, update: true}
  };

  meta.plural = pluralize(meta.singular);

  meta.$init = [];

  meta.init = function(cb) {
    _async.each(this.$init, function(initilizer, next)  {
      initilizer(next);
    }, cb);

    return meta;
  };
}
