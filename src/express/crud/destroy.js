module.exports = destroy_middleware;
module.exports.destroy = destroy;

function destroy(mdl, id, error, ok) {
  mdl.model.findByIdAndRemove(id, function(err, data) {
    if (err) {
      return error(500, err);
    }

    ok();
  });
}

function destroy_middleware(mdl) {
  return function(req, res, next) {
    var id = req.params[mdl.json.$express.id_param];
    // TODO int validation?!

    return destroy(mdl, id, res.error, function() {
      res.status(204).json();
    });
  };
}
