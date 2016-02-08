module.exports = schema_angular;
module.exports.each_control = each_control;

var constraints = {
  "required": "ng-required",
  "min": "ng-min",
  "max": "ng-max",
  //"enum": "ng-enum",
  "minlength": "ng-minlength",
  "maxlength": "ng-maxlength",
  "match": "ng-pattern"
};

var err_messages = {
  required: "Field is required",
  number: "Field is not a valid number",
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
      if (kan) {
        if (schema[k].constraints[kan] === undefined) {
          if ("boolean" == typeof odb) {
            schema[k].constraints[kan] = odb ? "true" : "false";
          } else {
            schema[k].constraints[kan] = odb;
          }
        }
        var err_id = kan.substring(3);
        o.display.errors[err_id] = err_messages[err_id];
      }
    });

    // add type validation by hand
    if (o.display.type == "number") {
      o.display.errors["number"] = err_messages["number"];
    }


    schema[k].container.class = Object.keys(schema[k].constraints);

    // angular select
    if (o.display.type == "select") {
      // labels are required
      if (!o.display || Array.isArray(o.display)) {
        throw new Error("labels are required for select display type.");
      }
    }
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

function check_action(action, options) {
  // internal values like __v
  // or fields that aren't exposed to angular
  if (!options.options.display) {
    return false;
  }
  // if it has no type, can be displayed!
  if (!options.options.display.type) {
    return false;
  }

  // fallback to api?
  if (options.options.display[action] === undefined) {
    return !!options.options[action];
  }

  return !!options.options.display[action];
}

function each_control (mdl, action, cb) {
  mdl.schema.eachPath(function(path, options) {
    // ignore private
    if (["_id", "__v", "created_at", "updated_at"].indexOf(path) !== -1) {
      return ;
    }

    if (!check_action(action, options)) {
      return;
    }
    cb(options, path);
  });
}
