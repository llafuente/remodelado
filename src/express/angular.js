module.exports = {
  routes: routes_middleware,
  forms: forms_middleware,
  list_tpl: list_tpl_middleware
};

var routes = require("../angular/routes.js");
var form = require("../angular/form.js");
var list = require("../angular/list.tpl.js");

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

function forms_middleware(mdl) {
  console.log("forms_middleware", mdl.name);

  return function(req, res, next) {
    //console.log("create_form", mdl.name);
    var action = req.query.action || "create";
    var layout = req.query.layout || "vertical";

    form(mdl, action, layout, "form", "entity", function(err, controls) {
      if (err) {
        return res.error(err);
      }
      console.log("output!");
      return res.status(200).send(controls.join("\n\n"));
    });
  };
}

function list_tpl_middleware(mdl) {
  console.log("forms_middleware", mdl.name);

  return function(req, res, next) {
    //console.log("list.html", mdl.name);

    list(mdl, null, function(err, html) {
      if (err) {
        return res.error(err);
      }
      console.log("output!");
      return res.status(200).send(html);
    });
  };
}
