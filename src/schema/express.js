module.exports = schema_express;

var _ = require('lodash');
var mongoosemask = require('mongoosemask');

function schema_express(meta) {
  meta.express = meta.express || {};

  // url staff
  var id_param = meta.singular + '_id';
  meta.$express = {
    id_param: id_param,
    list: '/' + meta.plural,
    create: '/' + meta.plural,
    read: '/' + meta.plural + '/:' + id_param,
    update: '/' + meta.plural + '/:' + id_param,
    delete: '/' + meta.plural + '/:' + id_param,
  };

  // common cleanup before send
  var blacklist = [];

  meta.$schema.eachPath(function(path, options) {
    if (options.options.restricted === true) {
      blacklist.push(path);
    }
  });

  // use the user one after our common clean up
  // rename _id -> id
  // remove __v
  // remove restricted
  var before_send = meta.express.before_send;
  meta.$express.before_send = function before_send_cb (req, method, output, cb) {
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
      return before_send(req, method, output, cb);
    }

    cb(null, output);
  };
}
