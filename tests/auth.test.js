'use strict';


// test
var request = require('supertest');
var test = require('tap').test;
var tutils = require('./utils');

var app = require("../server/express.js");
var config = require("../server/config/index.js");
require("./start.js")(test, app, config);

test('login as admin', function(t) {
  tutils.login(app, "admin@admin.com", "admin", function(err, data) {
    console.log(data);
    t.error(err);
    t.end();
  });
});

test('login as reader', function(t) {
  tutils.login(app, "reader@admin.com", "admin", function(err, data) {
    console.log(data);
    t.error(err);
    t.end();
  });
});

test('/users/me admin', function(t) {
  request(app)
  .post("/users/me")
  .use(tutils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    console.log(res.body);
    t.equal(res.body.username, "admin@admin.com");
    t.error(err);
    t.end();
  });
});

test('/users/me reader', function(t) {
  request(app)
  .post("/users/me")
  .use(tutils.authorization("reader@admin.com"))
  .expect(200)
  .end(function(err, res) {
    console.log(res.body);
    t.equal(res.body.username, "reader@admin.com");
    t.error(err);
    t.end();
  });
});

require("./finish.js");
