'use strict';

module.exports = destroy_middleware;
module.exports.destroy = destroy;

function destroy(meta, id, next) {
  meta.$model.findByIdAndRemove(id, function(err, data) {
    /* istanbul ignore next */ if (err) {
      return next(err);
    }

    next(null);
  });
}

function destroy_middleware(meta) {
  return function(req, res, next) {
    var id = req.params[meta.$express.id_param];
    // TODO int validation?!

    return destroy(meta, id, function(err) {
      /* istanbul ignore next */ if (err) {
        return next(err);
      }

      res.status(204).json();
    });
  };
}
