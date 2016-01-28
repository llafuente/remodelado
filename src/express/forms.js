var form = require("../angular/form.js");
module.exports = create_form_middleware;

var mongoosemask = require('mongoosemask');
var clean_body = require('./clean_body.js');

function create_form_middleware(mdl) {
  console.log("create_form_middleware", mdl.name);

  return function(req, res, next) {
    //console.log("create_form", mdl.name);
    var action = req.query.action || "create";
    var layout = req.query.layout || "vertical";

    form(mdl, action, layout, "form", "entity", function(err, controls) {
      if (err) {
        return res.error(err);
      }
      console.log("output!");
      return res.status(200).send(controls.join("\n\n"));
    });
  };
}
