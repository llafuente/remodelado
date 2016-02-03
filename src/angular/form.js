module.exports = form;

var assert = require("assert");
var jade = require("jade");
var join = require("path").join;

// TODO use in prod: https://www.npmjs.com/package/cachedfs
var fs = require("fs");

// TODO cache compiled
function gen_control(control, path, form_path, base_path, layout, cb) {
  //console.log("control", control);

  var file = join(__dirname, "templates", "control-" + control.type + ".jade");
  fs.readFile(file, {encoding: "utf-8"}, function(err, data) {
    var file_str = "extends ./tpl-control-" + layout + ".jade\n\n" + data;

    if (err) {
      return cb(err, null);
    }

    var compiled = jade.compile(file_str, {
      filename: file,
      pretty: true
    });

    try {
      var html = compiled({
        //debug: true,
        layout: layout,

        form_path: form_path,
        control_path: form_path + "." + control.name,
        model: base_path + "." + control.name,

        control: control,
        error_messages: {
          number: "xxxx",
        }
      });
      return cb(null, html);
    } catch(e) {
      return cb(e, null);
    }
  });

}

function check_action(action, options) {
  if (options.options.display[action] === undefined) {
    return !!options.options[action];
  }

  return !!options.options.display[action];
}

function form(mdl, action, layout, form_path, base_path, cb) {
  assert.ok(["create", "update"].indexOf(action) !== -1);
  assert.ok(["vertical", "horizontal", "inline"].indexOf(layout) !== -1);

  form_path = form_path || "form";
  base_path = base_path || "entity";

  var controls = [];
  var errors = [];
  var todo = 0;

  mdl.schema.eachPath(function(path, options) {
    // ignore private
    if (["_id", "__v", "created_at", "updated_at"].indexOf(path) !== -1) {
      return ;
    }

    if (!check_action(action, options)) {
      return;
    }

    ++todo;

    gen_control(options.options.display, path, form_path, base_path, layout, function(err, html) {
      --todo;

      if (err) {
        errors.push(err);
      } else {
        controls.push(html);
      }

      if (!todo) {
        if (errors.length) {
          return cb(errors, null);
        }

        var file = join(__dirname, "templates", "form.jade");
        fs.readFile(file, {encoding: "utf-8"}, function(err, form_jade) {
          if (err) {
            return cb(err, null);
          }


          var compiled = jade.compile(form_jade, {
            filename: file,
            pretty: true
          });

          try {
            var html = compiled({
              name: form_path,
              controls: controls
            });

            console.log("form generated, returned");
            return cb(null, html);
          } catch(e) {
            return cb(e, null);
          }
        });
      }
    });
  });
}
