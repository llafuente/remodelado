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

  r.get(meta.$express.list, list(meta));
  r.get(meta.$express.read, read(meta));
  r.post(meta.$express.create, create(meta));
  r.patch(meta.$express.update, update(meta));
  r.delete(meta.$express.delete, destroy(meta));

  // angular
  r.get(meta.$angular.routes, angular.routes(meta));

  r.get(meta.$angular.templates.list, angular.list_tpl(meta));
  r.get(meta.$angular.controllers.list, angular.list_ctrl(meta));
  r.get(meta.$angular.controllers.create, angular.create_ctrl(meta));
  r.get(meta.$angular.controllers.update, angular.update_ctrl(meta));

  r.get(meta.$angular.templates.create, function(req, res, next) {
    req.query.action = 'create';
    req.query.button = {
      text: 'Create',
      inprogress: 'Creating'
    };
    next();
  },angular.forms(meta));
  r.get(meta.$angular.templates.update, function(req, res, next) {
    req.query.action = 'update';
    req.query.button = {
      text: 'Save',
      inprogress: 'Saving'
    };
    next();
  },angular.forms(meta));

  return r;
}
