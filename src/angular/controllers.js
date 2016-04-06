'use strict';

module.exports = {
  configuration: configuration,
  list_ctrl: list_ctrl,
  create_ctrl: create_ctrl,
  update_ctrl: update_ctrl,
};

var _ = require('lodash');
var join = require('path').join;
var $angular = require('../schema/angular.js');

// TODO use in prod: https://www.npmjs.com/package/cachedfs
var fs = require('fs');

function configuration(meta, app_name, base_state, cb) {
  base_state = base_state ? base_state + '.' + meta.plural : meta.plural;

  fs.readFile(join(__dirname, 'templates/configuration.js'), {encoding: 'utf-8'}, function(err, js) {
    /* istanbul ignore next */ if (err) {
      return cb(err, null);
    }

    console.dir({
      app_name: app_name,
      entity_name: meta.plural,
      navbar: meta.frontend.navbar,
      schema: meta.frontend.schema,

      base_state: base_state,
      states: meta.$angular.states,
      templates: meta.$angular.templates,
      controllers: meta.$angular.controllers,
      api: meta.$express,
    });

    var compiled = _.template(js);
    cb(null, compiled({
      app_name: app_name,
      entity_name: meta.plural,
      navbar: meta.frontend.navbar,
      schema: meta.frontend.schema,

      base_state: base_state,
      states: meta.$angular.states,
      templates: meta.$angular.templates,
      controllers: meta.$angular.controllers,
      api: meta.$express,
    }));
  });
}


function list_ctrl(meta, app_name, cb) {
  fs.readFile(join(__dirname, 'templates/list.ctrl.js'), {encoding: 'utf-8'}, function(err, js) {
    /* istanbul ignore next */ if (err) {
      return cb(err, null);
    }

    var compiled = _.template(js);
    cb(null, compiled({
      app_name: app_name,

      controllers: meta.$angular.controllers,
      api: meta.$express,
    }));
  });
}

function get_controls_js(meta, action, cb) {
  var todo = 0;
  var controls_js = [];
  $angular.each_control(meta, action, function(client_opt/*, path*/) {
    todo++;
    fs.readFile(join(__dirname, 'controls/control-' + client_opt.type + '.js'), {encoding: 'utf-8'}, function(err, js) {
      --todo;
      // TODO do not ignore not found
      // this should be whitelisted
      if (!err) {
        var compiled = _.template(js);
        controls_js.push(compiled({
          control: client_opt
        }));
      }

      if (!todo) {
        cb(controls_js.join('\n\n'));
      }
    });
  });
}

function create_ctrl(meta, app_name, cb) {
  get_controls_js(meta, 'create', function(controls_js) {
    fs.readFile(join(__dirname, 'templates/create.ctrl.js'), {encoding: 'utf-8'}, function(err, js) {
      /* istanbul ignore next */ if (err) {
        return cb(err, null);
      }

      var compiled = _.template(js);
      cb(null, compiled({
        app_name: app_name,
        controls_js: controls_js,

        controllers: meta.$angular.controllers,
        api: meta.$express,
      }));
    });
  });
}

function update_ctrl(meta, app_name, cb) {
  get_controls_js(meta, 'update', function(controls_js) {
    fs.readFile(join(__dirname, 'templates/update.ctrl.js'), {encoding: 'utf-8'}, function(err, js) {
      /* istanbul ignore next */ if (err) {
        return cb(err, null);
      }

      var compiled = _.template(js);
      cb(null, compiled({
        app_name: app_name,
        controls_js: controls_js,

        api: meta.$express,
        controllers: meta.$angular.controllers,
      }));
    });
  });
}
