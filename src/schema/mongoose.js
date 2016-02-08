module.exports = schema_mongoose;

var _ = require('lodash');

function schema_mongoose(json) {

  /* istanbul ignore next */
  if (json.schema.__v) {
    throw new Error("__v is reserved, use another identifier.");
  }
  /* istanbul ignore next */
  if (json.schema.version) {
    throw new Error("version is reserved, use another identifier.");
  }

  json.schema.__v = {
    type: "number",
    select: false
  };

  // TODO add a version plugin
}
