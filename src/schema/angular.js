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

  // always have the full metadata available
  _.forEach(json.schema, function(field, kf) {
    _.forEach(field, function(o, k) {
      if (constraints[k]) {
        field.$constraints[constraints[k]] = o;
      }
    })
  });
}
