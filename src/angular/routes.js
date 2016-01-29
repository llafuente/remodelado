module.exports = routes;

var _ = require("lodash");
var assert = require("assert");
var jade = require("jade");
var join = require("path").join;

// TODO use in prod: https://www.npmjs.com/package/cachedfs
var fs = require("fs");

function routes(mdl, app_name, base_state, cb) {
  base_state = base_state ? base_state + "." + mdl.plural : mdl.plural;

  fs.readFile(join(__dirname, "templates/routes.js"), {encoding: "utf-8"}, function(err, js) {
    if (err) {
      return cb(err, null);
    }

    var compiled = _.template(js);
    cb(null, compiled({
      base_state: base_state,
      param_url: mdl.param_url,

      list_tpl: mdl.list_tpl,
      list_url: mdl.list_url,

      read_url: mdl.read_url,

      app_name: app_name
    }));
  });
}
