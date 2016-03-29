'use strict';

module.exports = update_middleware;

var mongoosemask = require('mongoosemask');
var clean_body = require('../clean_body.js');
var http_error = require('../http.error.js');

function update(meta, user, row, data, blacklist, next) {
  clean_body(meta, data);
  data = mongoosemask.mask(data, blacklist);
  data = meta.$express.restricted_filter(user, 'update', data);

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

function update_middleware(meta) {
  var blacklist = [];

  meta.$schema.eachPath(function(path, options) {
    if (options.options.update === false) {
      blacklist.push(path);
    }
  });

  console.log('# update middleware', meta.name, ' blacklist', blacklist);

  return function(req, res, next) {
    req.log.info(req.body);

    if (Array.isArray(req.body)) {
      return next(new http_error(422, 'body is an array'));
    }

    var id = req.params[meta.$express.id_param];
    // TODO int validation?!

    meta.$model.findById(id, function(err, row) {
      /* istanbul ignore next */ if (err) {
        return next(err);
      }

      /* istanbul ignore next */
      if (!row) {
        return res.status(404).json({error: 'Not found'}); // todo err message
      }

      row.setRequest(req);

      return update(meta, req.user, row, req.body, blacklist, function(err, saved_row) {
        /* istanbul ignore next */ if (err) {
          return next(err);
        }

        meta.$express.before_send(req, 'update', saved_row.toJSON(), function(err, output) {
          /* istanbul ignore next */ if (err) {
            return next(err);
          }

          res.status(200).json(output);
        });
      });
    });
  };
}
