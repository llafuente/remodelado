'use strict';

module.exports = schema_default;

var _ = require('lodash');
var pluralize = require('pluralize');

var default_schema = {
  type: 'string',
  create: false,
  update: false
};

function schema_default(meta) {
  var t = meta.backend.schema;
  meta.backend.schema = {};

  _.forEach(t, function(o, k) {
    meta.backend.schema[k] = _.defaults(o, default_schema);
  });

  meta.plural = pluralize(meta.singular);
}
