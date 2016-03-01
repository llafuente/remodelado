module.exports = schema_mongoose;

var _ = require('lodash');
var timestamps = require('mongoose-timestamp');

function schema_mongoose(meta, mongoose) {

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

  meta.$schema = new mongoose.Schema(meta.backend.schema, meta.mongoose);
  meta.$schema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  meta.$schema.methods.setRequest = function(req) {
    this.$req = req;
  };
  meta.$schema.pre('save', function(next) {
    // search for a user!
    // request must be set!
    if (!this.$req) {
      throw new Error("setRequest must be called before save");
    }

    // permissions
    // $__.activePaths._changeState(path, 'init') // ignore ?
    next();
  });

  meta.init = function() {
    meta.$model = mongoose.model(meta.singular, meta.$schema);
  }

  // TODO add a version plugin
}
