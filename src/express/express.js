module.exports = express;

var _ = require("lodash");
var mongoosemask = require('mongoosemask');

function express(mdl) {
  mdl.express = _.cloneDeep(mdl.json.express || {});

  var blacklist = [];

  mdl.schema.eachPath(function(path, options) {
    if (options.options.restricted === true) {
      blacklist.push(path);
    }
  });

  // use the user one after our common clean up
  // rename _id -> id
  // remove __v
  // remove restricted
  var before_send = mdl.express.before_send;
  mdl.express.before_send = function before_send_cb (method, output, cb) {
    switch(method) {
    case "update":
    case "create":
    case "read":
      // TODO remove and use an autoincrement
      output.id = output._id;
      delete output._id;
      delete output.__v;
      break;
    case "list":
      var i;
      for (i = 0; i < output.length; ++i) {
        output[i].id = output[i]._id;
        delete output[i] ._id;
        delete output[i].__v;
      }
    }

    output = mongoosemask.mask(output, blacklist);

    if (before_send) {
      return before_send(method, output, cb);
    }

    cb(null, output);
  }
}
