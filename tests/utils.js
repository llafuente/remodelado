module.exports = {
  login: login,
  update_bearer: update_bearer,
  authorization: authorization
};

var request = require('supertest');
var logged = {};

function login(app, username, pwd, callback) {
  request(app)
    .post('/api/auth')
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
      throw new Error("user[" + username + "] not logged previously")
    }

    r.set('authorization', logged[username]);
    return r;
  }
}
