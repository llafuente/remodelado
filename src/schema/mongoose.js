'use strict';

module.exports = schema_mongoose;

var _ = require('lodash');
var timestamps = require('mongoose-timestamp');
var utils = require('./utils.js');
var _async = require('async');

function simplify_schema(obj, prop, value) {
  if (!prop) {
    var i;
    for (i in obj) {
      simplify_schema(obj, i, obj[i]);
    }
  } else {
    switch(value.type) {
      case "Object":
        obj[prop] = value.properties;
        simplify_schema(obj[prop]);
        break;
      case "Array":
        obj[prop] = [value.items];
        simplify_schema(obj[prop]);
    }
  }
}

function schema_mongoose(meta, mongoose, models) {

  /* istanbul ignore next */
  if (meta.backend.schema.__v) {
    throw new Error('__v is reserved, use another identifier.');
  }
  /* istanbul ignore next */
  if (meta.backend.schema.version) {
    throw new Error('version is reserved, use another identifier.');
  }


  meta.backend.schema.id = {
    type: 'Number',
    label: "ID",
    restricted: { create: true, update: true, read: false }
  };
  // NOTE __v need to be manually declared, or wont be in the paths
  meta.backend.schema.__v = {
    type: 'Number',
    label: "Version",
    select: false
  };


  // duplicate the Schema
  var schema = _.cloneDeep(meta.backend.schema);
  simplify_schema(schema);
  $log.all(schema);

  //utils.loop(meta.backend.schema, console.log);
  //process._rawDebug(schema);

  // TODO add a version plugin

  meta.$schema = new mongoose.Schema(schema, meta.backend.options);

  /*
  meta.$schema.virtual('id').get(function() {
    return this._id.toString();
  });
  */

  meta.$schema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  meta.$schema.methods.setRequest = function(req) {
    this.$req = req;
  };

  // autoincrements id
  meta.$schema.pre('save', function(next) {
    var self = this;
    if (this.isNew) {
      return mongoose.models.autoincrements.findOneAndUpdate({
        _id: meta.plural
      }, {
        $inc: {
          autoinc: 1
        },
        $setOnInsert: {
          _id: meta.plural,
          //autoinc: 1
        }
      }, {
        'new':  true,
        upsert: true,
      }, function (err, res) {
        if (!err) {
          self.id = res.autoinc;
          //self.update('id', res.autoinc);
        }

        next(err);
      });
    }
    next(null);
  });

  meta.$schema.pre('save', function(next) {
    // search for a user!
    // request must be set!
    if (!this.$req) {
      console.warn("setRequest should be called");
      //throw new Error('setRequest must be called before save');
    }

/*
    meta.$schema.eachPath(function(path, options) {
      if (options.options.set_current_user) {
        if (!this.$req.user) {
          throw new Error('Url required auth');
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

  meta.$init.push(function(done_cb) {
    meta.$schema.eachPath(function(path, options) {
      // if dont have restricted, fields are internal!
      // default are set before... so do not expose
      options.options.restricted = options.options.restricted || {
        read: false,
        create: true,
        update: true
      };
    });

    // create mongoose model
    meta.$model = mongoose.model(meta.plural, meta.$schema);

    _async.eachOf(meta.backend.permissions, function(v, k, next) {
      if (k) {
        var id = meta.$express.permissions[k];

        return models.permissions.$model.findOne({
          _id: id
        }, function(err, perm) {
          if (err) {
            throw err;
          }
          if (!perm) {
            return models.permissions.$model.create({
              _id: id,
              label: v
            }, function(err/*, data*/) {
              if (err) {
                throw err;
              }

              next();
            });
          }

          next();
        });
      }
      next();
    }, function(err) {
      // if any of the saves produced an error, err would equal that error
      done_cb();
    });
  });
}
