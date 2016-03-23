'use strict';

module.exports = {
  login: login,
  update_bearer: update_bearer,
  authorization: authorization,
  add_user_permissions: add_user_permissions,
  rem_user_permissions: rem_user_permissions
};

var request = require('supertest');
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
