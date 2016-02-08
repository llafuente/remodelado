module.exports = schema_default;

var _ = require('lodash');
var pluralize = require('pluralize');

var default_schema = {
  type: "string",
  create: false,
  update: false
};

function schema_default(meta) {
  var t = meta.schema;
  meta.schema = {};

  _.forEach(t, function(o, k) {
    meta.schema[k] = _.defaults(o, default_schema);
  });

  meta.singular = meta.name;
  meta.plural = pluralize(meta.name);
}
