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

function routes_middleware(meta) {
  console.log("# routes_middleware", meta.singular);

  return function(req, res, next) {
    var base_state = req.query.base_state || null;
    var app_name = req.query.app || "app";

    controllers.routes(meta, app_name, base_state, function(err, js_text) {
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

function forms_middleware(meta) {
  console.log("# forms_middleware", meta.singular);

  return function(req, res, next) {
    req.log.silly("create_form", meta.singular);
    var action = req.query.action || "create";
    var layout = req.query.layout || "horizontal";

    if (["create", "update"].indexOf(action) === -1) {
      return res.status(400).json({error: "Invalid action"});
    }

    var button = meta.frontend.buttons[req.query.action];

    form(meta, action, button, layout, "form", "entity", function(err, html) {
      /* istanbul ignore next */ if (err) {
        return res.error(err);
      }

      req.log.silly("return form generated");
      return res.status(200).send(html);
    });
  };
}

function list_tpl_middleware(meta) {
  console.log("# list_tpl_middleware", meta.singular);

  return function(req, res, next) {
    req.log.silly("list.html", meta.singular);

    templates.list(meta, null, function(err, html) {
      /* istanbul ignore next */ if (err) {
        return res.error(err);
      }

      req.log.silly("return list.html generated");
      return res.status(200).send(html);
    });
  };
}

function list_ctrl_middleware(meta) {
  console.log("# list_ctrl_middleware", meta.singular);

  return function(req, res, next) {
    req.log.silly("list.js", meta.singular);
    var app_name = req.query.app || "app";

    controllers.list_ctrl(meta, app_name, function(err, html) {
      /* istanbul ignore next */ if (err) {
        return res.error(err);
      }

      req.log.silly("return list.js generated");
      return res.status(200).send(html);
    });
  };
}

function create_ctrl_middleware(meta) {
  console.log("# create_ctrl_middleware", meta.singular);

  return function(req, res, next) {
    req.log.silly("create.js", meta.singular);
    var app_name = req.query.app || "app";

    controllers.create_ctrl(meta, app_name, function(err, html) {
      /* istanbul ignore next */ if (err) {
        return res.error(err);
      }

      req.log.silly("return create.js generated");
      return res.status(200).send(html);
    });
  };
}

function update_ctrl_middleware(meta) {
  console.log("# update_ctrl_middleware", meta.singular);

  return function(req, res, next) {
    req.log.silly("update.js", meta.singular);
    var app_name = req.query.app || "app";

    controllers.update_ctrl(meta, app_name, function(err, html) {
      /* istanbul ignore next */ if (err) {
        return res.error(err);
      }

      req.log.silly("return update.js generated");
      return res.status(200).send(html);
    });
  };
}
