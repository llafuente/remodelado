module.exports = schema_default;

var _ = require('lodash');
var default_field_data = {
  type: "string",
  display: "text",

  create: false,
  create_order: -1,

  update: false,
  update_order: -1,

  filter: false,
  filter_order: -1
};

function schema_default(json) {
  var t = json.schema;
  json.schema = {};

  _.forEach(t, function(o, k) {
    json.schema[k] = _.defaults(o, default_field_data);
  });
}