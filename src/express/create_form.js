var form = require("../angular/form.js");
module.exports = create_form_middleware;

var mongoosemask = require('mongoosemask');
var clean_body = require('./clean_body.js');

function create_form_middleware(mdl) {
  console.log("create_form_middleware", mdl.name);

  return function(req, res, next) {
    //console.log("create_form", mdl.name);

    form(mdl, "create", "vertical", "entity", function(err, html) {
      console.log(err);
      if (err) {
        return res.error(err);
      }
      res.status(200).send(html);
    });
  };
}
