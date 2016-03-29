'use strict';

module.exports = {
  authorization: authorization,
  has_permission: has_permission,
  has_role: has_role
};

var http_error = require('./http.error.js');

// NOTE every middleware has an err parameter
// NOTE use it to be less specific about the nature of the error

function authorization(err) {
  return function require_authorization(req, res, next) {
    if (!req.user) {
      return next(err || new http_error(403, 'Authorization is required'));
    }

    return next();
  };
}

function has_permission(perm, err) {
  if (!Array.isArray(perm)) {
    perm = [perm];
  }

  return function must_have_permission(req, res, next) {
    if (!req.user) {
      return next(err || new http_error(403, 'Authorization is required'));
    }

    if (!req.user.permissions) {
      return next(err || new http_error(403, 'Invalid user'));
    }

    // check @permissions and @roles.permissions
    var i;
    for (i = 0; i < perm.length; ++i) {
      if (!req.user.has_permission(perm[i])) {
        return next(err || new http_error(403, ['Access Denied', 'Permission required', perm[i]]));
      }
    }

    return next();
  };
}

function has_role(role, err) {
  if (!Array.isArray(role)) {
    role = [role];
  }

  return function must_have_role(req, res, next) {
    if (!req.user) {
      return next(err || new http_error(403, 'Authorization is required'));
    }

    if (!req.user.roles) {
      return next(err || new http_error(403, 'Invalid user'));
    }

    var i;
    for (i = 0; i < role.length; ++i) {
      if (req.user.roles.indexOf(role[i]) === -1) {
        return next(err || new http_error(403, ['Access Denied', 'Role required', role[i]]));
      }
    }

    return next();
  };
}
