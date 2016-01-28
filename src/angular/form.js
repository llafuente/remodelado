module.exports = form;

var assert = require("assert");
var jade = require("jade");
var join = require("path").join;

// TODO use in prod: https://www.npmjs.com/package/cachedfs
var fs = require("fs");

// TODO cache compiled
function gen_control(field, path, base_path, layout, cb) {
  var file = join(__dirname, "/templates/control-" + field.options.display + ".jade");
  var file_str = "extends ./tpl-control-" + layout + ".jade\n\n" +
  fs.readFile(file, {encoding: "utf-8"}, function(err, data) {
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
        form_name: base_path,
        data: field
      });
      return cb(null, html);
    } catch(e) {
      return cb(e, null);
    }
  });

}

function form(mdl, action, layout, base_path, cb) {
  assert.ok(["create", "update"].indexOf(action) !== -1);
  assert.ok(["vertical", "horizontal", "inline"].indexOf(layout) !== -1);

  base_path = base_path || "entity";

  var controls = [];
  var errors = [];
  var todo = 0;

  mdl.schema.eachPath(function(path, options) {
    // ignore private
    if (["_id", "__v", "created_at", "updated_at"].indexOf(path) !== -1) {
      return ;
    }

    if (action == "create" && options.options.create === false) {
      return;
    }

    if (action == "update" && options.options.update === false) {
      return;
    }

    ++todo;

    controls.push(gen_control(options, path, base_path, layout, function(err, html) {
      --todo;

      if (err) {
        errors.push(err);
      } else {
        controls.push(html);
      }

      if (!todo) {
        console.log("form generated, returned");
        cb(errors, controls);
      }
    }));
  });
}
