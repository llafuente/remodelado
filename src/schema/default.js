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

  meta.plural = pluralize(meta.singular);

  meta.$init = [];

  meta.init = function(cb) {
    _async.each(this.$init, function(initilizer, next)  {
      initilizer(next);
    }, cb);

    return meta;
  };
}
