'use strict';

module.exports = {
  is_path_restricted: is_path_restricted,
  each_path: each_path,
  get_path_options: get_path_options,
};

function is_path_restricted(meta, path, action, user) {
  var opt = get_path_options(meta, path);

  // TODO review...
  if (!opt) {
    return false;
  }

  var ref = opt.options.restricted[action];

  // TODO review...
  if (ref === undefined) {
    throw new Error('restricted not defined?!');
  }

  if (ref === true) {
    return true;
  }

  if (ref === false) {
    return false;
  }

  // string, check permissions
  return !user.has_permission(ref);
}

function each_path(meta, cb) {
  meta.$schema.eachPath(function(path, back_opt) {
    // fix: [ObjectId]
    if ('Array' === back_opt.instance) {
      back_opt = back_opt.caster;
    }

    var front_opt = meta.frontend.schema[path];
    cb(path, back_opt, front_opt);
  });
}

function get_path_options(meta, path) {
  var options = meta.$schema.path(path);
  // fix: [ObjectId]
  if ('Array' === options.instance) {
    return options.caster;
  }
  return options;
}
