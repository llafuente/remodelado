module.exports = update_middleware;

var mongoosemask = require('mongoosemask');
var clean_body = require('./clean_body.js');

function update(mdl, row, data, blacklist, error, ok) {
  clean_body(mdl, data);
  data = mongoosemask.mask(data, blacklist);

  // TODO review this!
  row.set(data);

  row.save(function(err, saved_row) {
    /* istanbul ignore next */ if (err) {
      return error(err);
    }

    /* istanbul ignore next */
    if (!saved_row) {
      return error(422, "database don't return data");
    }

    return ok(saved_row);
  });
}

function update_middleware(mdl) {
  var blacklist = [];

  mdl.schema.eachPath(function(path, options) {
    if (options.options.create === false) {
      blacklist.push(path);
    }
  });

  console.log("# update middleware", mdl.name, " blacklist", blacklist);

  return function(req, res, next) {
    req.log.info(req.body);

    if (Array.isArray(req.body)) {
      return res.error(422, "body is an array");
    }

    var id = req.params[mdl.json.$express.id_param];
    // TODO int validation?!

    mdl.model.findById(id, function(err, row) {
      /* istanbul ignore next */ if (err) {
        return res.error(err);
      }

      /* istanbul ignore next */
      if (!row) {
        return res.status(404).json({error: "Not found"}); // todo err message
      }

      return update(mdl, row, req.body, blacklist, res.error, function(saved_row) {
        mdl.express.before_send("update", saved_row.toJSON(), function(err, output) {
          /* istanbul ignore next */ if (err) {
            return res.error(err);
          }

          // TODO remove and use an autoincrement
          output.id = output._id;
          delete output._id;

          res.status(200).json(output);
        });
      });
    });
  };
}
