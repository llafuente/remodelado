module.exports = router;

var express = require("express");
var error_handler = require("./error.js");

var list = require("./list.js");
var create = require("./create.js");

var angular = require("./angular.js");

function router(mdl) {
  var r = express.Router();

  //crud
  r.use(function(req, res, next) {
    res.error = function(err, message) {
      if (arguments.length == 2) {
        err = {status: err, message: message};
      }

      return error_handler(err, res, mdl.schema);
    };
    next();
  });

  // api
  r.get(mdl.list_url, list(mdl));
  r.post(mdl.create_url, create(mdl));

  // angular
  r.get(mdl.forms_url, angular.forms(mdl));
  r.get(mdl.routes_url, angular.routes(mdl));
  r.get(mdl.list_tpl_url, angular.list_tpl(mdl));
  r.get(mdl.list_ctrl_url, angular.list_ctrl(mdl));

  return r;
}
