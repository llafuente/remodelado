module.exports = router;

var express = require("express");
var error_handler = require("./error.js");

var read = require("./crud/read.js");
var list = require("./crud/list.js");
var create = require("./crud/create.js");
var update = require("./crud/update.js");
var destroy = require("./crud/destroy.js");

var angular = require("./angular.js");

function router(meta) {
  var r = express.Router();

  //crud
  r.use(function(req, res, next) {
    res.error = function(err, message) {
      if (arguments.length == 2) {
        err = {status: err, message: message};
      }

      return error_handler(err, req, res, meta.$schema);
    };
    next();
  });

  // api

  //console.log(meta);
  r.get(meta.$express.list, list(meta));
  r.get(meta.$express.read, read(meta));
  r.post(meta.$express.create, create(meta));
  r.patch(meta.$express.update, update(meta));
  r.delete(meta.$express.delete, destroy(meta));

  // angular
  // internal: r.get(meta.$angular.templates.forms, angular.forms(meta));
  r.get(meta.$angular.routes, angular.routes(meta));

  r.get(meta.$angular.templates.list, angular.list_tpl(meta));
  r.get(meta.$angular.controllers.list, angular.list_ctrl(meta));
  r.get(meta.$angular.controllers.create, angular.create_ctrl(meta));
  r.get(meta.$angular.controllers.update, angular.update_ctrl(meta));

  r.get(meta.$angular.templates.create, function(req, res, next) {
    req.query.action = 'create';
    next();
  },angular.forms(meta));
  r.get(meta.$angular.templates.update, function(req, res, next) {
    req.query.action = 'update';
    next();
  },angular.forms(meta));

  return r;
}
