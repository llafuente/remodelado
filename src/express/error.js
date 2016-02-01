module.exports = error_handler;

var mongoose = require("mongoose");
var ValidationError = mongoose.Error.ValidationError;
var _ = require('lodash');
var forEach = _.forEach;
var clone = _.clone;

function error_handler(err, res, schema) {
  console.log("ERROR:", JSON.stringify(err));
  console.log(err.stack);

  if (Array.isArray(err)) {
    return res.status(500).json({
      error: err.map(function(e) {
        return e.message;
      })
    });
  }

  if (err instanceof ValidationError) {
    // cleanup error
    var errors = [];

    forEach(err.errors, function(err, path) {
      var value = clone(err);

      if (value.name == "CastError") {
        value.type = "invalid-type";
        value.message = "cast-failed";
        value.value_constraint = "cast";
      } else if (value.name == "ValidatorError") {
        value.type = "invalid-value";
        value.value_type = null; // ??
        value.value_constraint = value.properties.kind || value.properties.type;
        delete value.properties;
      }
      var options = schema.path(path);
      value.label = options.options.label;

      if (!options) {
        value.value_type = value.value_type === undefined ? null : value.value_type;
      } else if ("function" === typeof options.options.type){
        value.value_type = options.options.type.name.toLowerCase();
      } else {
        value.value_type = options.options.type;
      }

      delete value.name;
      delete value.kind;
      //not necessary, redundant
      delete value.properties;

      errors.push(value);
    });

    return res.status(400).json({error: errors});
  }

  if (err.status) {
    return res.status(err.status).json({error: err.message});
  }

  return res.status(500).json({error: err.message});
}
