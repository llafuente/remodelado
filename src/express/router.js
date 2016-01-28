module.exports = router;

var express = require("express");
var error_handler = require("./error.js");
var create = require("./create.js");
var create_form = require("./create_form.js");

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

  r.post(mdl.create_url, create(mdl));
  r.get(mdl.create_form, create_form(mdl));

  return r;
}
