'use strict';

module.exports = update_middleware;

var clean_body = require('../clean_body.js');
var http_error = require('../http.error.js');

function update(meta, log, user, row, data, next) {
  clean_body(meta, data);

  data = meta.$express.restricted_filter(log, user, 'update', data);

  // TODO review this!
  row.set(data);

  row.save(function(err, saved_row) {
    /* istanbul ignore next */ if (err) {
      return next(err);
    }

    /* istanbul ignore next */
    if (!saved_row) {
      return next(new http_error(422, 'database don\'t return data'));
    }

    return next(null, saved_row);
  });
}

function update_middleware(meta, stored_at, store_at) {
  console.log('# update middleware', meta.name);

  return function(req, res, next) {
    req.log.info(req.body);

    if (Array.isArray(req.body)) {
      return next(new http_error(422, 'body is an array'));
    }

    var row = req[stored_at];
    row.setRequest(req);

    return update(meta, req.log, req.user, row, req.body, function(err, saved_row) {
      /* istanbul ignore next */ if (err) {
        return next(err);
      }

      req[store_at] = saved_row;
      next();
    });
  };
}
