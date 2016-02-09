module.exports = {
  routes: routes_middleware,
  forms: forms_middleware,
  list_tpl: list_tpl_middleware,
  list_ctrl: list_ctrl_middleware,
  create_ctrl: create_ctrl_middleware,
  update_ctrl: update_ctrl_middleware,
};

var controllers = require("../angular/controllers.js");
var templates = require("../angular/templates.js");
var form = require("../angular/form.js");

function routes_middleware(mdl) {
  console.log("# routes_middleware", mdl.name);

  return function(req, res, next) {
    var base_state = req.query.base_state || null;
    var app_name = req.query.app || "app";

    controllers.routes(mdl, app_name, base_state, function(err, js_text) {
      /* istanbul ignore next */ if (err) {
        return res.error(err);
      }

      req.log.silly("return js generated");
      return res
        .status(200)
        .set('Content-Type', 'application/javascript; charset=utf-8')
        .send(js_text);
    });
  };
}

function forms_middleware(mdl) {
  console.log("# forms_middleware", mdl.name);

  return function(req, res, next) {
    req.log.silly("create_form", mdl.name);
    var action = req.query.action || "create";
    var button = req.query.button || "Create";
    var layout = req.query.layout || "horizontal";

    form(mdl, action, button, layout, "form", "entity", function(err, html) {
      /* istanbul ignore next */ if (err) {
        return res.error(err);
      }

      req.log.silly("return form generated");
      return res.status(200).send(html);
    });
  };
}

function list_tpl_middleware(mdl) {
  console.log("# list_tpl_middleware", mdl.name);

  return function(req, res, next) {
    req.log.silly("list.html", mdl.name);

    templates.list(mdl, null, function(err, html) {
      /* istanbul ignore next */ if (err) {
        return res.error(err);
      }

      req.log.silly("return list.html generated");
      return res.status(200).send(html);
    });
  };
}

function list_ctrl_middleware(mdl) {
  console.log("# list_ctrl_middleware", mdl.name);

  return function(req, res, next) {
    req.log.silly("list.js", mdl.name);
    var app_name = req.query.app || "app";

    controllers.list_ctrl(mdl, app_name, function(err, html) {
      /* istanbul ignore next */ if (err) {
        return res.error(err);
      }

      req.log.silly("return list.js generated");
      return res.status(200).send(html);
    });
  };
}

function create_ctrl_middleware(mdl) {
  console.log("# create_ctrl_middleware", mdl.name);

  return function(req, res, next) {
    req.log.silly("create.js", mdl.name);
    var app_name = req.query.app || "app";

    controllers.create_ctrl(mdl, app_name, function(err, html) {
      /* istanbul ignore next */ if (err) {
        return res.error(err);
      }

      req.log.silly("return create.js generated");
      return res.status(200).send(html);
    });
  };
}

function update_ctrl_middleware(mdl) {
  console.log("# update_ctrl_middleware", mdl.name);

  return function(req, res, next) {
    req.log.silly("update.js", mdl.name);
    var app_name = req.query.app || "app";

    controllers.update_ctrl(mdl, app_name, function(err, html) {
      /* istanbul ignore next */ if (err) {
        return res.error(err);
      }

      req.log.silly("return update.js generated");
      return res.status(200).send(html);
    });
  };
}
