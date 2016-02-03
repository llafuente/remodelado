module.exports = {
  routes: routes,
  list_ctrl: list_ctrl,
  create_ctrl: create_ctrl
}

var _ = require("lodash");
var assert = require("assert");
var jade = require("jade");
var join = require("path").join;

// TODO use in prod: https://www.npmjs.com/package/cachedfs
var fs = require("fs");

function routes(mdl, app_name, base_state, cb) {
  base_state = base_state ? base_state + "." + mdl.plural : mdl.plural;

  fs.readFile(join(__dirname, "templates/routes.js"), {encoding: "utf-8"}, function(err, js) {
    /* istanbul ignore next */ if (err) {
      return cb(err, null);
    }

    var compiled = _.template(js);
    cb(null, compiled({
      app_name: app_name,

      base_state: base_state,
      id_param: mdl.json.$express.id_param,
      states: mdl.json.$angular.states,
      templates: mdl.json.$angular.templates,
      controllers: mdl.json.$angular.controllers,
      api: mdl.json.$express,
    }));
  });
}


function list_ctrl(mdl, app_name, cb) {
  fs.readFile(join(__dirname, "templates/list.ctrl.js"), {encoding: "utf-8"}, function(err, js) {
    /* istanbul ignore next */ if (err) {
      return cb(err, null);
    }

    var compiled = _.template(js);
    cb(null, compiled({
      app_name: app_name,

      controllers: mdl.json.$angular.controllers,
    }));
  });
}

function create_ctrl(mdl, app_name, cb) {
  fs.readFile(join(__dirname, "templates/create.ctrl.js"), {encoding: "utf-8"}, function(err, js) {
    /* istanbul ignore next */ if (err) {
      return cb(err, null);
    }

    var compiled = _.template(js);
    cb(null, compiled({
      app_name: app_name,

      controllers: mdl.json.$angular.controllers,
    }));
  });
}
