module.exports = {
  list: list
};

var assert = require("assert");
var jade = require("jade");
var join = require("path").join;

// TODO use in prod: https://www.npmjs.com/package/cachedfs
var fs = require("fs");
var $angular = require("../schema/angular.js");

function list(meta, listable_fields, cb) {
  if (!listable_fields) {
    listable_fields = $angular.each_control_sorted(meta, "list");
  }

  var file = join(__dirname, "templates", "list.jade");
  fs.readFile(file, {encoding: "utf-8"}, function(err, file_str) {
    /* istanbul ignore next */ if (err) {
      return cb(err, null);
    }

    var compiled = jade.compile(file_str, {
      filename: file,
      pretty: true
    });

    try {
      var html = compiled({
        name: meta.plural,
        id_param: meta.$express.id_param,
        states: meta.$angular.states,
        button: meta.interface.buttons.list_create,
        listable_fields: listable_fields,
      });
      return cb(null, html);
    } catch(e) {
      return cb(e, null);
    }
  });
}
