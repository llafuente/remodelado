module.exports = read_middleware;

function read_middleware(mdl) {
  return function(req, res, next) {

    var id = req.params[mdl.json.$express.id_param];
    // TODO int validation?!

    mdl.model.findById(id, function(err, mdata) {
      /* istanbul ignore next */ if (err) {
        return res.error(err);
      }

      /* istanbul ignore next */
      if (!mdata) {
        return res.status(404).json({error: "Not found"}); // todo err message
      }

      var data = mdata.toJSON();

      mdl.express.before_send("read", data, function(err, output) {
        /* istanbul ignore next */ if (err) {
          return res.error(err);
        }

        // TODO remove and use an autoincrement
        output.id = output._id;
        delete output._id;

        res.status(200).json(output);
      });
    });
  };
}
