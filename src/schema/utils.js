'use strict';

module.exports = {
  is_path_restricted: is_path_restricted,
  each_path: each_path,
  get_path_options: get_path_options,
  loop: loop
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

// cb(value, path, parent, prop_in_parent, realpath)
function loop(obj, cb, prop, value, path, realpath) {
  path = path || [];
  realpath = realpath || [];

  if (!value) {
    var i;
    for (i in obj) {
      loop(obj, cb, i, obj[i], path);
    }
  } else {
    path.push(prop);

    if (value.type === "Array") {
      realpath.push(prop);
      realpath.push(`[${prop}_id]`);
    } else if(obj.type !== "Array") {
      realpath.push(prop);
    }

    //console.log("calling cb for", path, value);
    cb(value, path.join(".").replace(/\.\[/g, "["), obj, prop, realpath.join(".").replace(/\.\[/g, "["));
    //console.log("value.type", value.type, "items", value.items);
    switch(value.type) {
      case "Object":
        loop(value.properties, cb, "properties", null, path, realpath);
        break;
      case "Array":
        loop(value, cb, "items", value.items, path, realpath);
        break;
    }

    path.pop();

    if (value.type === "Array") {
      realpath.pop();
      realpath.pop();
    } else if(obj.type !== "Array") {
      realpath.pop();
    }

  }
}
