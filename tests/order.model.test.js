var api = require("../src/index.js");
var cheerio = require("cheerio");

// test
var request = require('supertest');
var test = require('tap').test;
var fs = require('fs');
var join = require('path').join;
var tutils = require('./utils');

var app = require("../server/express.js");
var config = require("../server/config/index.js");
var api = require("./start.js")(test, app, config);

test('create user model', function (t) {
  var model = require("./order.model.json");
  var mdl = api.model(model);
  mdl.init();

  app.use(mdl.$router);

  mdl.$model.remove({}, function() {
    t.end();
  });
});

test('http: create user (err)', function (t) {
  tutils.login(app, "admin@admin.com", "admin", function(err) {
    t.error(err);
    t.end();
  });
});

test('http: create user (err)', function (t) {
  request(app)
  .post("/orders")
  .use(tutils.authorization("admin@admin.com"))
  .send({
    description: "description 01"
  })
  .expect(201)
  .end(function(err, res) {
    console.log(res.body);
    t.error(err);
    t.end();
  });
});

require("./finish.js");
