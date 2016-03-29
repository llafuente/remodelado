'use strict';

module.exports = create_middleware;
module.exports.create = create;

var mongoosemask = require('mongoosemask');
var clean_body = require('../clean_body.js');
var http_error = require('../http.error.js');

function create(meta, req, data, next) {
  clean_body(meta, data);
  delete data.__v;

  var blacklist = meta.$express.blacklisted.create;
  data = mongoosemask.mask(data, blacklist);

  data = meta.$express.restricted_filter(req.user, 'create', data);

  var entity = new meta.$model(data);
  entity.setRequest(req);

  return entity.save(function(err, mdata) {
    if (err) {
      return next(err);
    }

    /* istanbul ignore next */
    if (!mdata) {
      return next(new http_error(500, 'database don\'t return data'));
    }

    next(null, mdata);
  });
}

function create_middleware(meta, store_at) {
  console.log('# create middleware', meta.name);

  return function(req, res, next) {
    req.log.info(req.body);

    if (Array.isArray(req.body)) {
      return next(new http_error(422, 'body is an array'));
    }

    return create(meta, req, req.body, function(err, saved_data) {
      /* istanbul ignore next */ if (err) {
        return next(err);
      }

      req[store_at] = saved_data;
      next();
    });
  };
}
