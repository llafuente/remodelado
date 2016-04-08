'use strict';

var _ = require('lodash');

// test
var request = require('supertest');
var test = require('tap').test;
var test_utils = require('./utils');

var app = require("../server/express.js");
var config = require("../server/config/index.js");
require("./start.js")(test, app, config);

var roles_ids;
test('/roles admin', function(t) {
  request(app)
  .get("/api/roles")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    t.equal(res.body.list.length, 2);
    roles_ids = _.map(res.body.list, "_id");
    t.error(err);
    t.end();
  });
});

var user_id;
// get first user id
test('/users/ admin', function(t) {
  request(app)
  .get("/api/users")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    console.log(res.body);
    t.type(res.body.list[0]._id, "string");
    t.type(res.body.list[0].id, "number");
    user_id = res.body.list[0]._id;

    t.error(err);
    t.end();
  });
});

// add both roles and check
test('/users/:id admin', function(t) {
  request(app)
  .patch("/api/users/" + user_id)
  .send({
    roles: roles_ids
  })
  .use(test_utils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    t.error(err);
    // add both roles and check
    request(app)
    .get("/api/users/" + user_id)
    .use(test_utils.authorization("admin@admin.com"))
    .expect(200)
    .end(function(err, res) {
      t.deepEqual(res.body.roles, roles_ids, "roles id match");

      t.error(err);
      t.end();
    });
  });
});

test('http: get user list (nested where)', function(t) {
  request(app)
  .get("/api/users?where={\"data.first_name\": \"Administrator\"}")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    console.log(res.body);
    t.equal(res.body.count, 1, "found the admin!");

    t.error(err);
    t.end();
  });
});

test('http: get user list (nested where)', function(t) {
  request(app)
  .get("/api/users?where={\"data$first_name\": \"Administrator\"}")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    console.log(res.body);
    t.equal(res.body.count, 1, "found the admin!");

    t.error(err);
    t.end();
  });
});

require("./finish.js");
