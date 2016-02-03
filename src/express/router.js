module.exports = router;

var express = require("express");
var error_handler = require("./error.js");

var read = require("./read.js");
var list = require("./list.js");
var create = require("./create.js");
var update = require("./update.js");

var angular = require("./angular.js");

function router(mdl) {
  var r = express.Router();

  //crud
  r.use(function(req, res, next) {
    res.error = function(err, message) {
      if (arguments.length == 2) {
        err = {status: err, message: message};
      }

      return error_handler(err, req, res, mdl.schema);
    };
    next();
  });

  // api
  var json = mdl.json;
  //console.log(json);
  r.get(json.$express.list, list(mdl));
  r.get(json.$express.read, read(mdl));
  r.post(json.$express.create, create(mdl));
  r.patch(json.$express.update, update(mdl));

  // angular
  // internal: r.get(json.$angular.templates.forms, angular.forms(mdl));
  r.get(json.$angular.routes, angular.routes(mdl));

  r.get(json.$angular.templates.list, angular.list_tpl(mdl));
  r.get(json.$angular.controllers.list, angular.list_ctrl(mdl));
  r.get(json.$angular.controllers.create, angular.create_ctrl(mdl));

  r.get(json.$angular.templates.create, function(req, res, next) {
    req.query.action = 'create';
    next();
  },angular.forms(mdl));

  return r;
}
