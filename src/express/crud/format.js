'use strict';

module.exports = format;

var _async = require('async');
var Pagination = require('./pagination.js');

function format(meta, src_name, dst_name) {
  return function(req, res, next) {

    if (req[src_name] instanceof Pagination) {
      return _async.map(req[src_name].list, function(entity, cb) {
        entity = entity.toJSON();

        return meta.$express.formatter(req, entity, function(err, output) {
          /* istanbul ignore next */ if (err) {
            return cb(err);
          }

          cb(null, output);
        });
      }, function(err, output_list) {
        /* istanbul ignore next */ if (err) {
          return next(err);
        }

        // TODO clone?!
        req[dst_name].list = output_list;
        req[dst_name] = req[src_name];
        next();
      });
    }

    var obj = req[src_name].toJSON();

    meta.$express.formatter(req, obj, function(err, output) {
      /* istanbul ignore next */ if (err) {
        return next(err);
      }

      req[dst_name] = output;

      return next();
    });
  };
}
