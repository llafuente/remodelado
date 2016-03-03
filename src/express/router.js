module.exports = router;

var express = require("express");
var error_handler = require("./error-handler.js");

var read = require("./crud/read.js");
var list = require("./crud/list.js");
var create = require("./crud/create.js");
var update = require("./crud/update.js");
var destroy = require("./crud/destroy.js");
var angular = require("./angular.js");

function router(meta) {
  var r = express.Router();

  //crud
  r.use(error_handler.middleware(meta));

  // api

  if (meta.backend.permissions.list) {
    r.get(meta.$express.list, list(meta));
    r.get(meta.$angular.templates.list, angular.list_tpl(meta));
    r.get(meta.$angular.controllers.list, angular.list_ctrl(meta));
  }

  if (meta.backend.permissions.read) {
    r.get(meta.$express.read, read(meta));
  }

  if (meta.backend.permissions.create) {
    r.post(meta.$express.create, create(meta));
    r.get(meta.$angular.controllers.create, angular.create_ctrl(meta));
    r.get(meta.$angular.templates.create, function(req, res, next) {
      req.query.action = 'create';
      next();
    },angular.forms(meta));
  }

  if (meta.backend.permissions.update) {
    if (!meta.backend.permissions.read) {
      throw new Error(meta.singular + " invalid permissions: update require read");
    }

    r.patch(meta.$express.update, update(meta));
    r.get(meta.$angular.controllers.update, angular.update_ctrl(meta));
    r.get(meta.$angular.templates.update, function(req, res, next) {
      req.query.action = 'update';
      next();
    },angular.forms(meta));
  }

  if (meta.backend.permissions.delete) {
    r.delete(meta.$express.delete, destroy(meta));
  }

  // angular
  r.get(meta.$angular.routes, angular.routes(meta));

  return r;
}
