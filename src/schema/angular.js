'use strict';

module.exports = schema_angular;
module.exports.each_control = each_control;
module.exports.each_control_sorted = each_control_sorted;

var constraints = {
  'required': 'ng-required',
  'min': 'ng-min',
  'max': 'ng-max',
  //'enum': 'ng-enum',
  'minlength': 'ng-minlength',
  'maxlength': 'ng-maxlength',
  'match': 'ng-pattern'
};


// NOTE each line must be prefixed with '|'
var err_messages = {
  required: '| #{control.label} is required',
  email: '| #{control.label} must be a valid email',
  number: '| #{control.label} is not a valid number',
  minlength: '| #{control.label} is too short, at least #{control.constraints[\'ng-minlength\']} characters',
  maxlength: '| #{control.label} is too long, at most #{control.constraints[\'ng-maxlength\']} characters',
  min: '| #{control.label} is too big, should be less than #{control.constraints.min} characters',
  max: '| #{control.label} is too small, should at least #{control.constraints.max} characters',
  match: '| #{control.label} must match #{control.constraints.ng-pattern}'
};


var _ = require('lodash');

function __build_labels(meta, back_field, front_field) {
  // build labels array
  switch (front_field.type) {
  case 'checklist':
  case 'select':
    var src = back_field;

    // TODO review this may not be necessary or in fact wrong!
    if ('array' === src.type) {
      src = src.items;
      if ('ObjectId' === src.type) {
        if (!front_field.source_url) {
          console.error(front_field);
          throw new Error('source_url must be defined');
        }
      }
    }

    if (!front_field.source_url) {
      if (!src.enum) {
        console.error(back_field);
        throw new Error('enum is not defined');
      }
      if (!src.labels) {
        console.error(back_field);
        throw new Error('labels is not defined');
      }
      if (src.enum.length !== src.labels.length) {
        console.error(back_field);
        throw new Error('enum and labels must have same length');
      }

      front_field.labels = [];
      var i;
      for (i = 0; i < src.enum.length; ++i) {
        front_field.labels.push({id: src.enum[i], label: src.labels[i]});
      }
    }

    front_field.label_values = meta.singular + '_' + front_field.name + '_label_values';
    front_field.label_filter = meta.singular + '_' + front_field.name + '_label_filter';

    break;
  }
}

function schema_angular(meta) {
  // list
  _.forEach(meta.frontend.list, function(front_field, k) {
    var back_field = meta.$schema.path(k);
    if (!back_field) {
      console.warn(meta.singular, '[', k, '] is not found in schema');
      return;
    }
    // fix: [ObjectId]
    if (back_field.instance == "Array") {
      back_field = back_field.caster;
    }
    back_field = back_field.options;

    // cp label/name if needed
    if (!front_field.label) {
      front_field.label = back_field.label;
    }
    front_field.name = k;

    __build_labels(meta, back_field, front_field);
  });

  // create/update (schema)
  _.forEach(meta.backend.schema, function(o, k) {
    // fix: [ObjectId]
    if (Array.isArray(o)) {
      o = o[0];
    }

    if (!meta.frontend.schema[k]) {
      console.warn(meta.singular, '[', k, '] is not found in schema');
      return;
    }

    var front_field = meta.frontend.schema[k];
    front_field.constraints = front_field.constraints || {};
    front_field.container = front_field.container || {};
    front_field.errors = front_field.errors || {};

    // cp label/name
    front_field.label = o.label;
    front_field.name = k;

    _.forEach(o, function(odb, kdb) {
      var kan = constraints[kdb];
      // overwrite only if not set
      if (kan) {
        if (front_field.constraints[kan] === undefined) {
          if ('boolean' === typeof odb) {
            front_field.constraints[kan] = odb ? 'true' : 'false';
          } else {
            front_field.constraints[kan] = odb;
          }
        }
        var err_id = kan.substring(3);
        front_field.errors[err_id] = err_messages[err_id];
      }
    });

    // add type validation by hand
    ['number', 'email'].forEach(function(ty) {
      if (front_field.type === ty) {
        front_field.errors[ty] = err_messages[ty];
      }
    });

    __build_labels(meta, o, front_field);

    front_field.container.class = Object.keys(front_field.constraints);
  });

  meta.frontend.buttons = meta.frontend.buttons || {};
  meta.frontend.buttons = _.defaults(meta.frontend.buttons, {
    'list_create': {
      'text': 'Create'
    },
    'update': {
      'text': 'Save',
      'tooltip': 'Edit row',
      'inprogress': 'Saving'
    },
    'create': {
      'text': 'Create',
      'inprogress': 'Creating'
    },
    'delete': {
      'tooltip': 'Remove row',
      'alert': 'Are you sure to delete selected row?'
    }
  });

  meta.$angular = {
    configuration: '/angular/' + meta.plural + '.configuration.js',
    states: {
      root: meta.plural,
      list: meta.plural + '.list',
      create: meta.plural + '.create',
      update: meta.plural + '.update',
    },

    templates: {
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
function each_control_sorted(meta, action) {
  var controls = [];

  meta.$schema.eachPath(function(path) {
    // ignore private
    if (['_id', '__v', 'created_at', 'updated_at'].indexOf(path) !== -1) {
      return ;
    }

    var client_opt = meta.frontend.schema[path];
    if (client_opt && client_opt[action]) {
      controls.push(client_opt);
    }
  });

  return controls.sort(function(a, b) {
    return a[action] - b[action];
  });
}
function each_control(meta, action, cb) {
  meta.$schema.eachPath(function(path, options) {
    // ignore private
    if (['_id', '__v', 'created_at', 'updated_at'].indexOf(path) !== -1) {
      return ;
    }

    // fix: [ObjectId]
    if (options.instance == "Array") {
      options = options.caster;
    }

    var client_opt = meta.frontend.schema[path];
    console.log(path, options, client_opt);
    if (!check_action(action, options.options, client_opt)) {
      return;
    }

    // TODO this could be a problem because it's not one-one relation
    cb(client_opt, path);
  });
}
