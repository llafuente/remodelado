module.exports = schema_mongoose;

var _ = require('lodash');

function schema_mongoose(meta) {

  /* istanbul ignore next */
  if (meta.backend.schema.__v) {
    throw new Error("__v is reserved, use another identifier.");
  }
  /* istanbul ignore next */
  if (meta.backend.schema.version) {
    throw new Error("version is reserved, use another identifier.");
  }

  meta.backend.schema.__v = {
    type: "number",
    select: false
  };

  // TODO add a version plugin
}
