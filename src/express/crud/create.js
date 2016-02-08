module.exports = create_middleware;
module.exports.create = create;

var mongoosemask = require('mongoosemask');
var clean_body = require('../clean_body.js');

function create(meta, blacklist, data, error, ok) {
  clean_body(meta, data);
  delete data.__v;
  data = mongoosemask.mask(data, blacklist);

  return meta.$model.create(data, function(err, mdata) {
    if (err) {
      return error(err);
    }

    /* istanbul ignore next */
    if (!mdata) {
      return error(500, "database don't return data");
    }

    ok(mdata);
  });
}

function create_middleware(meta) {
  var blacklist = [];

  meta.$schema.eachPath(function(path, options) {
    if (options.options.create === false) {
      blacklist.push(path);
    }
  });

  console.log("# create middleware", meta.name, " blacklist", blacklist);

  return function(req, res, next) {
    req.log.info(req.body);

    if (Array.isArray(req.body)) {
      return res.error(422, "body is an array");
    }

    return create(meta, blacklist, req.body, res.error, function(mdata) {
      req.log.info("created ok");

      var data = mdata.toJSON();

      meta.$express.before_send("create", data, function(err, output) {
        /* istanbul ignore next */ if (err) {
          return res.error(err);
        }

        res.status(201).json(output);
      });

    });
  };
}
