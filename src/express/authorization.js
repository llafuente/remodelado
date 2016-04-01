'use strict';

module.exports = {
  authorization: authorization,
  has_permission: has_permission,
  has_role: has_role
};

var http_error = require('./http.error.js');
var _ = require('lodash');

// NOTE every middleware has an err parameter
// NOTE use it to be less specific about the nature of the error

function authorization(err) {
  return function require_authorization(req, res, next) {
    if (!req.user) {
      return next(err || new http_error(401, 'authorization is required'));
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
      return next(err || new http_error(401, 'authorization is required'));
    }

    if (!req.user.permissions) {
      return next(err || new http_error(403, 'invalid user'));
    }

    // check @permissions and @roles.permissions
    var i;
    for (i = 0; i < perm.length; ++i) {
      if (!req.user.has_permission(perm[i])) {
        return next(err || new http_error(403, ['permission required', perm[i]]));
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
      return next(err || new http_error(401, 'authorization is required'));
    }

    if (!req.user.roles) {
      return next(err || new http_error(403, 'invalid user'));
    }

    var i;
    var roles = req.user.roles;
    if (req.user.populated("roles")) {
      roles = _.map(req.user.roles, "_id");
    }

    for (i = 0; i < role.length; ++i) {
      if (roles.indexOf(role[i]) === -1) {
        return next(err || new http_error(403, ['role required', role[i]]));
      }
    }

    return next();
  };
}
