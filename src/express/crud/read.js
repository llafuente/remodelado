'use strict';

module.exports = read_middleware;

function read_middleware(meta) {
  return function(req, res/*, next*/) {

    var id = req.params[meta.$express.id_param];
    // TODO int validation?!

    meta.$model.findById(id, function(err, mdata) {
      /* istanbul ignore next */ if (err) {
        return res.error(err);
      }

      // TODO this could contains more info ?
      if (!mdata) {
        return res.status(404).json({error: 'Not found'});
      }

      var data = mdata.toJSON();

      meta.$express.before_send(req, 'read', data, function(err, output) {
        /* istanbul ignore next */ if (err) {
          return res.error(err);
        }

        res.status(200).json(output);
      });
    });
  };
}
