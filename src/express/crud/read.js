'use strict';

module.exports = read_middleware;
module.exports.read = read;
module.exports.read_nullable = read_nullable;

var http_error = require('../http.error.js');

function read_middleware(meta, store_at) {
  return function(req, res, next) {
    var id = req.params[meta.$express.id_param];

    return read(meta, id, req, res, function(err, output) {
      /* istanbul ignore next */ if (err) {
        return next(err);
      }

      req[store_at] = output;
      next();
    });
  };
}

//
// read model by id
// Return the data or throws (to next)
//
function read(meta, id, req, res, next) {
  meta.$model.findById(id, function(err, entity) {
    /* istanbul ignore next */ if (err) {
      return next(err);
    }

    if (!entity) {
      return next(new http_error(404, 'Not found'));
    }

    return next(null, entity);
  });
}

function read_nullable(meta, id, req, res, next) {
  meta.$model.findById(id, function(err, entity) {
    /* istanbul ignore next */ if (err) {
      return next(err);
    }

    if (!entity) {
      entity = null;
    }

    return next(null, entity);
  });
}
