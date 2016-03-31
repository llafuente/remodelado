'use strict';

var _ = require('lodash');

// test
var request = require('supertest');
var test = require('tap').test;
var tutils = require('./utils');

var app = require("../server/express.js");
var config = require("../server/config/index.js");
require("./start.js")(test, app, config);

test('login as admin', function(t) {
  tutils.login(app, "admin@admin.com", "admin", function(err, data) {
    t.error(err);
    t.end();
  });
});
var roles_ids;
test('/roles admin', function(t) {
  request(app)
  .get("/api/roles")
  .use(tutils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    t.equal(res.body.list.length, 2);
    roles_ids = _.map(res.body.list, "id");
    t.error(err);
    t.end();
  });
});

var user_id;
// get first user id
test('/users/ admin', function(t) {
  request(app)
  .get("/api/users")
  .use(tutils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    user_id = res.body.list[0].id;

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
  .use(tutils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    t.error(err);
    // add both roles and check
    request(app)
    .get("/api/users/" + user_id)
    .use(tutils.authorization("admin@admin.com"))
    .expect(200)
    .end(function(err, res) {
      t.deepEqual(res.body.roles, roles_ids, "roles id match");

      t.error(err);
      t.end();
    });
  });
});

require("./finish.js");
