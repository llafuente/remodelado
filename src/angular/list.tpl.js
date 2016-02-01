module.exports = list;

var assert = require("assert");
var jade = require("jade");
var join = require("path").join;

// TODO use in prod: https://www.npmjs.com/package/cachedfs
var fs = require("fs");

function list(mdl, listable_fields, cb) {
  if (!listable_fields) {
    listable_fields = [];

    mdl.schema.eachPath(function(path, options) {
      if (options.options.display && options.options.display.list) {
        listable_fields.push(options.options)
      }
    });

    listable_fields = listable_fields.sort(function(a, b) {
      return a.display.list - b.display.list;
    });
  }

  var file = join(__dirname, "templates", "list.jade");
  fs.readFile(file, {encoding: "utf-8"}, function(err, file_str) {
    if (err) {
      return cb(err, null);
    }

    var compiled = jade.compile(file_str, {
      filename: file,
      pretty: true
    });

    try {
      var html = compiled({
        listable_fields: listable_fields
      });
      return cb(null, html);
    } catch(e) {
      return cb(e, null);
    }
  });
}
