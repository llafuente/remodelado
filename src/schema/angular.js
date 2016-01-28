module.exports = schema_angular;

var constraints = {
  "required": "ng-required",
  "min": "ng-min",
  "max": "ng-max",
  "enum": "ng-enum",
  "minlength": "ng-minlength",
  "maxlength": "ng-maxlength",
  "match": "ng-pattern"
};

var _ = require('lodash');

function schema_angular(json) {
  var schema = {};

  _.forEach(json.schema, function(o, k) {
    o.display.constraints = o.display.constraints || {};
    o.display.container = o.display.container || {};
    o.display.errors = o.display.errors || {};
    schema[k] = o.display;
    schema[k].label = o.label;
    schema[k].name = k;

    _.forEach(o, function(odb, kdb) {
      var kan = constraints[kdb];
      // overwrite only if not set
      if (kan && schema[k].constraints[kan] === undefined) {
        schema[k].constraints[kan] = odb;
      }
    })
  });
}
