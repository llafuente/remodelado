module.exports = schema_mongoose;

var _ = require('lodash');
var timestamps = require('mongoose-timestamp');

function schema_mongoose(meta, mongoose, models) {

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
/*
    meta.$schema.eachPath(function(path, options) {
      if (options.options.set_current_user) {
        if (!this.$req.user) {
          throw new Error("Url required auth");
        }

        if (this.isNew && options.options.create) {
          this.update(path, this.$req.user._id);
        }
        if (!this.isNew && options.options.update) {
          this.update(path, this.$req.user._id);
        }
      }
    }.bind(this));
*/
    // permissions
    // $__.activePaths._changeState(path, 'init') // ignore ?
    next();
  });

  meta.init = function() {
    meta.$model = mongoose.model(meta.singular, meta.$schema);
    _.each(meta.backend.permissions, function(v, k) {
      if (v) {
        var id = `permission/${meta.singular}/${k}`;

        models.permissions.$model.update({
          id: id
        }, {
          id: id,
          label: v
        }, {
          upsert: true
        }, function(err, data) {
          if (err) {
            throw err;
          }
        });
      }
    });

  }

  // TODO add a version plugin
}
