module.exports = {
  authorization: authorization,
  has_permission: has_permission,
  has_role: has_role
};

function authorization(err) {
  return function require_authorization(req, res, next) {
    if (!req.user) {
      return res.error(403, err || new Error('Authorization is required'));
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
      res.error(403, new Error('Authorization is required'));
    }

    if (!req.user.permissions) {
      res.error(500, new Error('Invalid user'));
    }

    // check @permissions and @roles.permissions
    var j;
    var i;
    var found;
    var roles = req.user.roles;
    for (i = 0; i < perm.length; ++i) {
      if (req.user.permissions.indexOf(perm[i]) === -1) {

        // look at roles
        found = false;
        for (j = 0; j < roles.length; ++j) {
          if (roles[j].permissions.indexOf(perm[i]) !== -1) {
            found = true;
          }
        }

        if (!found) {
          return res.error(403, err || new Error(['Access Denied', 'Permision required', perm[i]]));
        }
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
      res.error(403, new Error('Authorization is required'));
    }

    if (!req.user.roles) {
      res.error(500, new Error('Invalid user'));
    }

    var i;
    for (i = 0; i < role.length; ++i) {
      if (req.user.roles.indexOf(role[i]) === -1) {
        return res.error(403, err || new Error(['Access Denied', 'Role required', role[i]]));
      }
    }

    return next();
  };
}
