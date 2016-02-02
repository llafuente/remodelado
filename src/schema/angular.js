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
    });
  });

  json.$angular = {
    routes: '/angular/' + json.plural + '.routes.js',
    states: {
      root: json.plural,
      list: json.plural + ".list",
      create: json.plural + ".create",
      update: json.plural + ".update",
    },
    templates: {
      forms: '/angular/' + json.plural + '.forms.tpl.html',
      create: '/angular/' + json.plural + '.create.tpl.html',
      update: '/angular/' + json.plural + '.update.tpl.html',
      list: '/angular/' + json.plural + '.list.tpl.html',
    },
    controllers: {
      create_ctrl: json.plural + 'CreateCtrl',
      create: '/angular/' + json.plural + '.create.ctrl.js',

      update_ctrl: json.plural + 'UpdateCtrl',
      update: '/angular/' + json.plural + '.update.ctrl.js',

      list_ctrl: json.plural + 'ListCtrl',
      list: '/angular/' + json.plural + '.list.ctrl.js',
    }
  };
}
