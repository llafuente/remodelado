module.exports = {
  routes: routes,
  list_ctrl: list_ctrl,
  create_ctrl: create_ctrl,
  update_ctrl: update_ctrl,
};

var _ = require("lodash");
var assert = require("assert");
var jade = require("jade");
var join = require("path").join;
var $angular = require("../schema/angular.js");

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

function get_controls_js(mdl, action, cb) {
  var todo = 0;
  var controls_js = [];
  $angular.each_control(mdl, action, function(options, path) {
    todo++;
    fs.readFile(join(__dirname, "templates/control-" + options.options.display.type + ".js"), {encoding: "utf-8"}, function(err, js) {
      --todo;
      // TODO do not ignore not found
      // this should be whitelisted
      if (!err) {
        var compiled = _.template(js);
        controls_js.push(compiled({
          control: options.options.display
        }));
      }

      if (!todo) {
        cb(controls_js.join("\n\n"));
      }
    });
  });
}

function create_ctrl(mdl, app_name, cb) {
  get_controls_js(mdl, "create", function (controls_js) {
    fs.readFile(join(__dirname, "templates/create.ctrl.js"), {encoding: "utf-8"}, function(err, js) {
      /* istanbul ignore next */ if (err) {
        return cb(err, null);
      }

      var compiled = _.template(js);
      cb(null, compiled({
        app_name: app_name,
        controls_js: controls_js,

        controllers: mdl.json.$angular.controllers,
      }));
    });
  });
}

function update_ctrl(mdl, app_name, cb) {
  get_controls_js(mdl, "update", function (controls_js) {
    fs.readFile(join(__dirname, "templates/update.ctrl.js"), {encoding: "utf-8"}, function(err, js) {
      /* istanbul ignore next */ if (err) {
        return cb(err, null);
      }

      var compiled = _.template(js);
      cb(null, compiled({
        app_name: app_name,
          controls_js: controls_js,

        controllers: mdl.json.$angular.controllers,
      }));
    });
  });
}
