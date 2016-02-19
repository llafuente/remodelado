module.exports = schema_angular;
module.exports.each_control = each_control;
module.exports.each_control_sorted = each_control_sorted;

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
  email: "Field must be a valid email",
  number: "Field is not a valid number",
};

var _ = require('lodash');

function schema_angular(meta) {
  var schema = {};

  _.forEach(meta.schema, function(o, k) {
    // TODO maybe warning...
    if (!meta.interface.schema[k]) return;

    schema[k] = meta.interface.schema[k];


    schema[k].constraints = schema[k].constraints || {};
    schema[k].container = schema[k].container || {};
    schema[k].errors = schema[k].errors || {};

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
        schema[k].errors[err_id] = err_messages[err_id];
      }
    });

    // add type validation by hand
    if (schema[k].type == "number") {
      schema[k].errors["number"] = err_messages["number"];
    }

    if (schema[k].type == "email") {
      schema[k].errors["email"] = err_messages["email"];
    }


    if (schema[k].labels) {
      schema[k].label_values = meta.name + '_' + k + '_label_values';
      schema[k].label_filter = meta.name + '_' + k + '_label_filter';
    }



    schema[k].container.class = Object.keys(schema[k].constraints);

    // angular select
    if (schema[k].type == "select") {
      // labels are required
      if (!schema[k] || Array.isArray(schema[k])) {
        throw new Error("labels are required for select display type.");
      }
    }
  });
  meta.interface.buttons = meta.interface.buttons || {}
  _.defaults(meta.interface.buttons, {
    "list_create": {
      "text": "Create"
    },
    "update": {
      "text": "Save",
      "inprogress": "Saving"
    },
    "create": {
      "text": "Create",
      "inprogress": "Creating"
    }
  });

  meta.$angular = {
    routes: '/angular/' + meta.plural + '.routes.js',
    states: {
      root: meta.plural,
      list: meta.plural + ".list",
      create: meta.plural + ".create",
      update: meta.plural + ".update",
    },
    templates: {
      forms: '/angular/' + meta.plural + '.forms.tpl.html',
      create: '/angular/' + meta.plural + '.create.tpl.html',
      update: '/angular/' + meta.plural + '.update.tpl.html',
      list: '/angular/' + meta.plural + '.list.tpl.html',
    },
    controllers: {
      create_ctrl: meta.plural + 'CreateCtrl',
      create: '/angular/' + meta.plural + '.create.ctrl.js',

      update_ctrl: meta.plural + 'UpdateCtrl',
      update: '/angular/' + meta.plural + '.update.ctrl.js',

      list_ctrl: meta.plural + 'ListCtrl',
      list: '/angular/' + meta.plural + '.list.ctrl.js',
    }
  };
}

function check_action(action, model_opt, client_opt) {
  // internal values like __v
  // or fields that aren't exposed to angular
  if (!client_opt) {
    return false;
  }
  // if it has no type, can be displayed!
  if (!client_opt.type) {
    return false;
  }

  // fallback to api?
  if (client_opt[action] === undefined) {
    return !!model_opt[action];
  }

  return !!client_opt[action];
}

// TODO fallback to api?!
function each_control_sorted (meta, action, cb) {
  var controls = [];

  meta.$schema.eachPath(function(path, options) {
    // ignore private
    if (["_id", "__v", "created_at", "updated_at"].indexOf(path) !== -1) {
      return ;
    }

    var client_opt = meta.interface.schema[path];
    if (client_opt && client_opt[action]) {
      controls.push(client_opt)
    }
  });

  return controls.sort(function(a, b) {
    return a[action] - b[action];
  });
}
function each_control (meta, action, cb) {
  meta.$schema.eachPath(function(path, options) {
    // ignore private
    if (["_id", "__v", "created_at", "updated_at"].indexOf(path) !== -1) {
      return ;
    }

    var client_opt = meta.interface.schema[path];

    if (!check_action(action, options.options, client_opt)) {
      return;
    }

    // TODO this could be a problem because it's not one-one relation
    cb(client_opt, path);
  });
}
