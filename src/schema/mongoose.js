module.exports = schema_mongoose;

var _ = require('lodash');

function schema_mongoose(json) {
  return json.schema;
  /*
  var schema = {};

  _.forEach(json.schema, function(o, k) {
    schema[k] = o.db;
  });
  */
}
