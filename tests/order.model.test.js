'use strict';

// test
var request = require('supertest');
var _ = require('lodash');
var test = require('tap').test;
var tutils = require('./utils');

var app = require("../server/express.js");
var config = require("../server/config/index.js");
var api = require("./start.js")(test, app, config);

test('create user model', function(t) {
  var model = require("./order.model.json");
  var mdl = api.model(model);
  mdl.init();

  app.use(mdl.$router);

  mdl.$model.remove({}, function() {
    // add permissions to admin
    api.models.roles.$model.findOne({
      label: 'Administrator'
    }, function(err, role) {
      t.error(err);
      role.permissions = role.permissions
        .concat(_.values(mdl.$express.permissions));
      role.setRequest({});
      role.save(function(err, role_saved) {
        t.error(err);

        t.end();
      });
    });
  });
});

test('http: create user (err)', function(t) {
  tutils.login(app, "admin@admin.com", "admin", function(err) {
    t.error(err);
    t.end();
  });
});

test('http: create user (err)', function(t) {
  request(app)
  .post("/orders")
  .use(tutils.authorization("admin@admin.com"))
  .send({
    description: "description 01"
  })
  .expect(201)
  .end(function(err, res) {
    t.error(err);
    t.end();
  });
});

require("./finish.js");
