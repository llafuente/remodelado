module.exports = router;

var express = require("express");
var error_handler = require("./error.js");
var create = require("./create.js");
var forms = require("./forms.js");

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
  r.get(mdl.forms_url, forms(mdl));

  return r;
}
