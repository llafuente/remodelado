'use strict';

var cheerio = require("cheerio");
var _ = require("lodash");

// test
var request = require('supertest');
var test = require('tap').test;
var test_utils = require('../utils.js');

var app = require("../../server/express.js");
var config = require("../../server/config/index.js");
var api = require("../start.js")(test, app, config);

test('create user model', function(t) {
  var json_model = require("./restricted.model.json");

  var mdl = api.model(json_model).init();
  app.use(mdl.$router);

  // this will end this test
  test_utils.clear_and_add_permissions(api, mdl, t);
});

test('login as admin', function(t) {
  test_utils.add_user_permissions(api, "admin@admin.com", [
    "permission-restricted-read",
    "permission-restricted-create",
    "permission-restricted-update"
  ], function(err, data) {
    t.error(err);
    t.end();
  });
});

[{
  perm_restricted: "perm_restricted-value",
  full_restricted: "full_restricted-value"
},{
  perm_restricted: "perm_restricted-value2",
  full_restricted: "full_restricted-value2"
}].forEach(function(u) {

  test('http: create', function(t) {
    request(app)
    .post("/restricted_models")
    .use(test_utils.authorization("admin@admin.com"))
    .send(u)
    .expect(201)
    .end(function(err, res) {
      t.equal(res.body.full_restricted, undefined, "full_restricted is not exposed");
      t.equal(res.body.perm_restricted, u.perm_restricted, "perm_restricted is exposed");

      t.isDate(res.body.created_at, "created_at defined");
      t.isDate(res.body.updated_at, "updated_at defined");
      t.error(err);
      t.end();
    });
  });
});

test('http: list', function(t) {
  request(app)
  .get("/restricted_models")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    t.equal(res.body.count, 2, "count 2");

    t.equal(res.body.list[0].perm_restricted, 'perm_restricted-value');
    t.equal(res.body.list[1].perm_restricted, 'perm_restricted-value2');

    t.equal(res.body.list[0].full_restricted, undefined);
    t.equal(res.body.list[1].full_restricted, undefined);

    t.error(err);
    t.end();
  });
});

test('remove read permission', function(t) {
  test_utils.rem_user_permissions(api, "admin@admin.com", [
    "permission-restricted-read"
  ], function(err, data) {
    t.error(err);
    t.end();
  });
});

test('http: list (without read permission)', function(t) {
  request(app)
  .get("/restricted_models")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    t.equal(res.body.count, 2, "count 2");

    t.equal(res.body.list[0].perm_restricted, undefined);
    t.equal(res.body.list[1].perm_restricted, undefined);

    t.equal(res.body.list[0].full_restricted, undefined);
    t.equal(res.body.list[1].full_restricted, undefined);

    t.error(err);
    t.end();
  });
});

test('remove create permission', function(t) {
  test_utils.rem_user_permissions(api, "admin@admin.com", [
    "permission-restricted-create"
  ], function(err, data) {
    t.error(err);
    t.end();
  });
});

test('add read permission', function(t) {
  test_utils.add_user_permissions(api, "admin@admin.com", [
    "permission-restricted-read"
  ], function(err, data) {
    t.error(err);
    t.end();
  });
});

var entity_id;
test('http: create without perm', function(t) {
  request(app)
  .post("/restricted_models")
  .use(test_utils.authorization("admin@admin.com"))
  .send({
    perm_restricted: "xxx",
    full_restricted: "xxx"
  })
  .expect(201)
  .end(function(err, res) {
    t.type(res.body.id, "number", "id defined and a number");
    t.type(res.body._id, "string", "_id defined and a string");
    entity_id = res.body._id;

    t.equal(res.body.full_restricted, undefined, "full_restricted is not exposed");
    t.equal(res.body.perm_restricted, "default-value", "perm_restricted is exposed and default value");

    t.isDate(res.body.created_at, "created_at defined");
    t.isDate(res.body.updated_at, "updated_at defined");
    t.error(err);
    t.end();
  });
});

test('http: update with perm', function(t) {
  request(app)
  .patch("/restricted_models/" + entity_id)
  .use(test_utils.authorization("admin@admin.com"))
  .send({
    perm_restricted: "xxx2",
    full_restricted: "xxx2"
  })
  .expect(200)
  .end(function(err, res) {
    t.equal(res.body.full_restricted, undefined, "full_restricted is not exposed");
    t.equal(res.body.perm_restricted, "xxx2", "perm_restricted is exposed and changed");

    t.error(err);
    t.end();
  });
});

test('remove create permission', function(t) {
  test_utils.rem_user_permissions(api, "admin@admin.com", [
    "permission-restricted-update"
  ], function(err, data) {
    t.error(err);
    t.end();
  });
});

test('http: update without perm', function(t) {
  request(app)
  .patch("/restricted_models/" + entity_id)
  .use(test_utils.authorization("admin@admin.com"))
  .send({
    perm_restricted: "xxx3",
    full_restricted: "xxx3"
  })
  .expect(200)
  .end(function(err, res) {
    t.equal(res.body.full_restricted, undefined, "full_restricted is not exposed");
    t.equal(res.body.perm_restricted, "xxx2", "perm_restricted is exposed and not changed");

    t.error(err);
    t.end();
  });
});

test('http: get create user form', function(t) {
  request(app)
  .get("/angular/restricted_models.create.tpl.html")
  .expect(200)
  .end(function(err, res) {
    var $ = cheerio.load(res.text);
    t.equal($(".control-container").toArray().length, 2);

    t.error(err);
    t.end();
  });
});

require("../finish.js");
