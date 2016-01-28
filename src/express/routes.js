var routes = require("../angular/routes.js");
module.exports = routes_middleware;

var mongoosemask = require('mongoosemask');
var clean_body = require('./clean_body.js');

function routes_middleware(mdl) {
  console.log("routes_middleware", mdl.name);

  return function(req, res, next) {
    var base_state = req.query.base_state || null;
    var app_name = req.query.app || "app";

    routes(mdl, app_name, base_state, function(err, js_text) {
      if (err) {
        return res.error(err);
      }

      console.log("output!");
      return res
        .status(200)
        .set('Content-Type', 'application/javascript; charset=utf-8')
        .send(js_text);
    });
  };
}
