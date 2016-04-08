'use strict';


// test
var request = require('supertest');
var test = require('tap').test;
var test_utils = require('./utils');

var app = require("../server/express.js");
var authorization = require("../src/express/authorization.js");
var error_handler = require("../src/express/error-handler.js");
var config = require("../server/config/index.js");
var api = require("./start.js")(test, app, config);

test('invalid user login', function(t) {
  request(app)
  .post('/users/auth')
  .send({
    username: "cantbefound@user.com",
    password: "xxx"
  })
  .expect(422)
  .end(function(err, res) {
    t.deepEqual(res.body, {"error":"user not found or invalid pasword"});
    t.error(err);
    t.end();
  });
});

test('/users/me admin', function(t) {
  request(app)
  .post("/users/me")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    t.equal(res.body.username, "admin@admin.com");
    t.error(err);
    t.end();
  });
});

test('/users/me reader', function(t) {
  request(app)
  .post("/users/me")
  .use(test_utils.authorization("reader@admin.com"))
  .expect(200)
  .end(function(err, res) {
    t.equal(res.body.username, "reader@admin.com");
    t.error(err);
    t.end();
  });
});

test('/roles (err)', function(t) {
  request(app)
  .get("/api/roles")
  .use(test_utils.authorization("empty@admin.com"))
  .expect(403)
  .end(function(err, res) {
    t.deepEqual(res.body, {
      "error":[
        "permission required",
        "permission-roles-list"
      ]
    });
    t.error(err);
    t.end();
  });
});

test('custom url has_roles', function(t) {
  api.$router.get(
    "/custom-url",
    authorization.has_role('readonly'),
    function(req, res/*, next*/) {
      res.status(200).json({success: true});
    },
    error_handler.middleware
  );

  request(app)
  .get("/custom-url")
  .use(test_utils.authorization("empty@admin.com"))
  .expect(403)
  .end(function(err, res) {
    t.deepEqual(res.body, {
      "error":[
        "role required",
        "readonly"
      ]
    });
    t.error(err);
    t.end();
  });
});

test('custom url has_roles', function(t) {
  request(app)
  .get("/custom-url")
  .use(test_utils.authorization("reader@admin.com"))
  .expect(200)
  .end(function(err, res) {
    t.deepEqual(res.body, {
      "success": true
    });
    t.error(err);
    t.end();
  });
});

test('delete user in db, all requests fails', function(t) {
  api.models.user.$model.remove({
    username: "empty@admin.com"
  }, function(err) {
    t.error(err);

    request(app)
    .get("/custom-url")
    .use(test_utils.authorization("empty@admin.com"))
    .expect(401)
    .end(function(err, res) {
      t.deepEqual(res.body, {
        "error": "regenerate session failed"
      });
      t.error(err);
      t.end();
    });
  });
});

test('/users/me anon access', function(t) {

  request(app)
  .get("/api/users/me")
  .expect(401)
  .end(function(err, res) {
    t.deepEqual(res.body, {
      "error": "authorization is required"
    });
    t.error(err);
    t.end();
  });

});


require("./finish.js");
