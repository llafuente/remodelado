'use strict';

module.exports = destroy_middleware;
module.exports.destroy = destroy;

function destroy(meta, id, error, ok) {
  meta.$model.findByIdAndRemove(id, function(err, data) {
    if (err) {
      return error(500, err);
    }

    ok();
  });
}

function destroy_middleware(meta) {
  return function(req, res, next) {
    var id = req.params[meta.$express.id_param];
    // TODO int validation?!

    return destroy(meta, id, res.error, function() {
      res.status(204).json();
    });
  };
}
