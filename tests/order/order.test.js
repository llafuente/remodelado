'use strict';

// test
var request = require('supertest');
var _ = require('lodash');
var test = require('tap').test;
var test_utils = require('../utils');

var app = require("../../server/express.js");
var config = require("../../server/config/index.js");
var api = require("../start.js")(test, app, config);

test('create user model', function(t) {
  var model = require("./order.model.json");

  var mdl = api.model(model).init();
  app.use(mdl.$router);

  test_utils.clear_and_add_permissions(api, mdl, t);
});

test('http: create user (err)', function(t) {
  request(app)
  .post("/orders")
  .use(test_utils.authorization("admin@admin.com"))
  .send({
    description: "description 01"
  })
  .expect(201)
  .end(function(err, res) {
    t.error(err);
    t.end();
  });
});

require("../finish.js");
