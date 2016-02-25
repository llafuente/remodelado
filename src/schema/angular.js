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


// NOTE each line must be prefixed with "|"
var err_messages = {
  required: "| #{control.label} is required",
  email: "| #{control.label} must be a valid email",
  number: "| #{control.label} is not a valid number",
  minlength: "| #{control.label} is too short, at least #{control.constraints['ng-minlength']} characters",
  maxlength: "| #{control.label} is too long, at most #{control.constraints['ng-maxlength']} characters",
  min: "| #{control.label} is too big, should be less than #{control.constraints.min} characters",
  max: "| #{control.label} is too small, should at least #{control.constraints.max} characters",
  required: "| #{control.label} is required",
  match: "| #{control.label} must match #{control.constraints.ng-pattern}"
};


var _ = require('lodash');

function __build_labels(meta, be_field, fe_field) {
  // build labels array
  switch (fe_field.type) {
  case "checklist":
  case "select":
    var src = be_field;
    if (be_field.type == "array") {
      src = be_field.array;
    }

    if (!src.enum) {
      console.error(be_field);
      throw new Error("enum is not defined");
    }
    if (!src.labels) {
      console.error(be_field);
      throw new Error("labels is not defined");
    }
    if (src.enum.length != src.labels.length) {
      console.error(be_field);
      throw new Error("enum and labels must have same length");
    }

    fe_field.labels = [];
    var i;
    for (i = 0; i < src.enum.length; ++i) {
      fe_field.labels.push({id: src.enum[i], label: src.labels[i]});
    }

    fe_field.label_values = meta.singular + '_' + fe_field.name + '_label_values';
    fe_field.label_filter = meta.singular + '_' + fe_field.name + '_label_filter';

    break;
  }
}

function schema_angular(meta) {
  var field;

  // list
  _.forEach(meta.frontend.list, function(field, k) {
    var be_field = meta.$schema.path(k);
    if (!be_field) {
      console.warn(k, "is not found in schema");
      return;
    }
    be_field = be_field.options;

    // cp label/name
    field.label = be_field.label;
    field.name = k;

    __build_labels(meta, be_field, field);
  });

  // create/update (schema)
  _.forEach(meta.backend.schema, function(o, k) {
    if (!meta.frontend.schema[k]) {
      console.warn(k, "is not found in schema");
      return;
    }

    field = meta.frontend.schema[k];


    field.constraints = field.constraints || {};
    field.container = field.container || {};
    field.errors = field.errors || {};

    // cp label/name
    field.label = o.label;
    field.name = k;

    _.forEach(o, function(odb, kdb) {
      var kan = constraints[kdb];
      console.log(k, kdb, kan);
      // overwrite only if not set
      if (kan) {
        if (field.constraints[kan] === undefined) {
          if ("boolean" == typeof odb) {
            field.constraints[kan] = odb ? "true" : "false";
          } else {
            field.constraints[kan] = odb;
          }
        }
        var err_id = kan.substring(3);
        field.errors[err_id] = err_messages[err_id];
      }
    });

    // add type validation by hand
    ["number", "email"].forEach(function(ty) {
      if (field.type == ty) {
        field.errors[ty] = err_messages[ty];
      }
    });

    __build_labels(meta, o, field);

    field.container.class = Object.keys(field.constraints);
  });

  meta.buttons = meta.buttons || {}
  _.defaults(meta.buttons, {
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

    var client_opt = meta.frontend.schema[path];
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

    var client_opt = meta.frontend.schema[path];

    if (!check_action(action, options.options, client_opt)) {
      return;
    }

    // TODO this could be a problem because it's not one-one relation
    cb(client_opt, path);
  });
}
