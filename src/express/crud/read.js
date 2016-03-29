'use strict';

module.exports = read_middleware;

var http_error = require('../http.error.js');

function read_middleware(meta) {
  return function(req, res, next) {

    var id = req.params[meta.$express.id_param];
    // TODO int validation?!

    meta.$model.findById(id, function(err, mdata) {
      /* istanbul ignore next */ if (err) {
        return next(err);
      }

      // TODO this could contains more info ?
      if (!mdata) {
        return next(new http_error(404, 'Not found'));
      }

      var data = mdata.toJSON();

      meta.$express.before_send(req, 'read', data, function(err, output) {
        /* istanbul ignore next */ if (err) {
          return next(err);
        }

        res.status(200).json(output);
      });
    });
  };
}
