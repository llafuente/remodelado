'use strict';

module.exports = form;

var assert = require('assert');
var jade = require('jade');
var join = require('path').join;
var $angular = require('../schema/angular.js');
var schema_utils = require('../schema/utils.js');

// TODO use in prod: https://www.npmjs.com/package/cachedfs
var fs = require('fs');

// TODO cache compiled
function gen_control(control, backend, form_path, base_path, action, layout, cb) {
  var file = join(__dirname, 'controls', 'control-' + control.type + '.jade');
  fs.readFile(file, {encoding: 'utf-8'}, function(err, data) {
    /* istanbul ignore next */ if (err) {
      return cb(err, null);
    }

    var file_str = 'extends ./tpl-control-' + layout + '.jade\n\n' + data;
    var compiled = jade.compile(file_str, {
      filename: file,
      pretty: true
    });

    try {
      var html = compiled({
        //debug: true,
        render: jade.render,

        layout: layout,

        form_path: form_path,
        control_path: form_path + '.' + control.name,
        model: base_path + '.' + control.name,

        action: action,
        control: control,
        backend: backend
      });
      return cb(null, html);
    } catch (e) {
      /* istanbul ignore next */
      return cb(e, null);
    }
  });
}

function form(meta, action, button, layout, form_path, base_path, cb) {
  assert.ok(['create', 'update'].indexOf(action) !== -1);
  assert.ok(['vertical', 'horizontal', 'inline'].indexOf(layout) !== -1);
  assert.ok(form_path != null);
  assert.ok(base_path != null);

  var controls = [];
  var errors = [];
  var todo = 0;

  $angular.each_control(meta, action, function(client_opt, path) {
    $log.info(`control found: ${path}`);
    ++todo;
    var server_opt = schema_utils.get_path_options(meta, path);
    gen_control(client_opt, server_opt, form_path, base_path, action, layout, function(err, html) {
      --todo;

      /* istanbul ignore next */ if (err) {
        errors.push(err);
      } else {
        controls.push(html);
      }

      if (!todo) {
        /* istanbul ignore next */ if (errors.length) {
          return cb(errors, null);
        }

        var file = join(__dirname, 'templates', 'form.jade');
        fs.readFile(file, {encoding: 'utf-8'}, function(err, form_jade) {
          /* istanbul ignore next */ if (err) {
            return cb(err, null);
          }


          var compiled = jade.compile(form_jade, {
            filename: file,
            pretty: true
          });

          try {
            var html = compiled({
              name: form_path,
              button: button,
              controls: controls,
              render: jade.render
            });

            return cb(null, html);
          } catch (e) {
            /* istanbul ignore next */
            return cb(e, null);
          }
        });
      }
    });
  });
}
