'use strict';

module.exports = {
  login: login,
  update_bearer: update_bearer,
  authorization: authorization,
  get_access_token: get_access_token,
  add_user_permissions: add_user_permissions,
  rem_user_permissions: rem_user_permissions,
  clear: clear,
  clear_and_add_permissions: clear_and_add_permissions,
};

var request = require('supertest');
var _ = require("lodash");
var logged = {};

function login(app, username, pwd, callback) {
  request(app)
    .post('/users/auth')
    .send({
      username: username,
      password: pwd
    })
    .end(function(err, res) {
      if (err) {
        return callback(err);
      }

      logged[username] = "Bearer " + res.body.token;

      return callback(null, res.body);
    });
}

function update_bearer(old, headers) {
  // update authorization bearer
  if (!headers['set-cookie']) {
    throw new Error("set-cookie header is expected");
  }

  if (headers['set-cookie'].length) {
    var cookie = headers['set-cookie'][0];
    cookie = cookie.substring(6, cookie.indexOf(";"));

    return "Bearer " + cookie;
  }

  return old;
}

function authorization(username) {
  return function(r) {
    if (!logged[username]) {
      throw new Error("user[" + username + "] not logged previously");
    }

    r.set('authorization', logged[username]);
    return r;
  };
}

function get_access_token(username) {
  return logged[username].substring(7);
}

function add_user_permissions(api, username, permissions, callback) {
  api.models.users.$model.findOne({
    username: username
  }, function(err, data) {
    var i;
    for (i = 0; i < permissions.length; ++i) {
      if (data.permissions.indexOf(permissions[i]) === -1) {
        data.permissions.push(permissions[i]);
      }
    }

    data.setRequest({});
    data.save(callback);
  });
}

function rem_user_permissions(api, username, permissions, callback) {
  api.models.users.$model.findOne({
    username: username
  }, function(err, data) {
    var i, c;
    for (i = 0; i < permissions.length; ++i) {
      c = data.permissions.indexOf(permissions[i]);
      if (c !== -1) {
        data.permissions.splice(c, 1);
      }
    }

    data.setRequest({});
    data.save(callback);
  });
}

function clear(api, mdl, t) {
  mdl.$model.remove({}, function(err) {
    t.error(err);
    t.end();
  });
}


function clear_and_add_permissions(api, mdl, t) {
  mdl.$model.remove({}, function() {
    // add permissions to admin
    api.models.roles.$model.findOne({
      label: 'Administrator'
    }, function(err, role) {
      t.error(err);
      role.permissions = role.permissions
        .concat(_.values(mdl.$express.permissions));
      role.setRequest({});
      role.save(function(err/*, role_saved*/) {
        t.error(err);

        t.end();
      });
    });
  });
}
