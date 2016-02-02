require("./start.js");

var remodelado = require("../src/index.js");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var app = require("../server/express.js");
var cheerio = require("cheerio");

// test
var request = require('supertest');
var test = require('tap').test;
var fs = require('fs');
var join = require('path').join;


test('create user model', function (t) {
  remodelado.use(mongoose);

  var model = require("./user.model.json");
  var mdl = remodelado.model(model);

  //console.log(
  //  require("util").inspect(mdl.json, {depth: null, colors: true})
  //);

  // schema check
  t.equal(mdl.json.schema.first_name.display.constraints['ng-required'], true);


  // url check
  t.equal(mdl.read_url, "/users/:user_id");
  t.equal(mdl.delete_url, "/users/:user_id");
  t.equal(mdl.update_url, "/users/:user_id");

  t.equal(mdl.create_url, "/users");
  t.equal(mdl.list_url, "/users");

  app.use(mdl.router);

  t.end();
});

test('http: create user', function (t) {
  request(app)
  .post("/users")
  .send({
    first_name: "José Manuel",
    last_name: "Pérez",
    age: 35
  })
  .expect(201)
  .end(function(err, res) {
    t.error(err);

    t.type(res.body.id, "string", "id type");
    t.type(res.body.first_name, "string", "first_name type");
    t.type(res.body.last_name, "string", "last_name type");
    t.equal(res.body.first_name, "José Manuel", "first_name value");
    t.equal(res.body.last_name, "Pérez", "last_name value");
    t.equal(res.body.age, 35, "age value");
    t.equal(res.body.bio, null, "bio value");
    t.isDate(res.body.created_at, "created_at defined");
    t.isDate(res.body.updated_at, "updated_at defined");

    t.end();
  });
});

test('http: create user (err)', function (t) {
  request(app)
  .post("/users")
  .send([1,2,3])
  .expect(422)
  .end(function(err, res) {
    t.error(err);

    t.equal(res.body.error, "body is an array");

    t.end();
  });
});

test('http: create user (err-required)', function (t) {
  request(app)
  .post("/users")
  .send({})
  .expect(400)
  .end(function(err, res) {
    t.error(err);

    t.deepEqual(res.body, {
      error: [
        {
          message: 'err-required',
          path: 'last_name',
          type: 'invalid-value',
          value_type: 'string',
          value_constraint: 'required',
          label: 'Last name'
        }, {
          message: 'err-required',
          path: 'first_name',
          type: 'invalid-value',
          value_type: 'string',
          value_constraint: 'required',
          label: 'First Name'
        }
      ]
    }, "error structure ok");


    t.end();
  });
});

test('http: create user (err-enum)', function (t) {
  request(app)
  .post("/users")
  .send({
    first_name: 101,
    last_name: "Pérez",
    role: "chiwaka"
  })
  .expect(400)
  .end(function(err, res) {
    t.error(err);

    t.deepEqual(res.body, {
      error: [
        {
          "label": "Role",
          "message": "err-out-of-bounds",
          "path": "role",
          "type": "invalid-value",
          "value": "chiwaka",
          "value_constraint": "enum",
          "value_type": "string"
        }
      ]
    }, "error structure ok");

    t.end();
  });
});

test('http: create user (err-cast)', function (t) {
  request(app)
  .post("/users")
  .send({
    first_name: "Manuel",
    last_name: "Pérez",
    age: "chiwaka"
  })
  .expect(400)
  .end(function(err, res) {
    t.error(err);

    t.deepEqual(res.body, {
      error: [
        {
          "label": "Age",
          "message": "cast-failed",
          "path": "age",
          "type": "invalid-type",
          "value": "chiwaka",
          "value_constraint": "cast",
          "value_type": "number"
        }
      ]
    }, "error structure ok");

    t.end();
  });
});

test('http: get create user form', function (t) {
  request(app)
  .get("/users/angular/controls.tpl.html?action=create")
  .expect(200)
  .end(function(err, res) {
    t.error(err);

    var $ = cheerio.load(res.text);
    t.equal($(".control-container").toArray().length, 6);

    t.end();
  });
});

test('http: get create user form', function (t) {
  request(app)
  .get("/users/angular/controls.tpl.html?action=update")
  .expect(200)
  .end(function(err, res) {
    t.error(err);

    var $ = cheerio.load(res.text);
    // bio cannot be updated! -1
    t.equal($(".control-container").toArray().length, 5);

    t.end();
  });
});

test('http: get user routes.js', function (t) {
  request(app)
  .get("/users/angular/routes.js?action=update")
  .expect(200)
  .end(function(err, res) {
    t.error(err);

    t.ok(res.text.length > 0);

    t.end();
  });
});

test('http: get user routes.js', function (t) {
  request(app)
  .get("/users/angular/routes.js?base_state=root&action=update")
  .expect(200)
  .end(function(err, res) {
    t.error(err);

    t.ok(res.text.length > 0);

    t.end();
  });
});


test('http: get user list', function (t) {
  request(app)
  .get("/users")
  .expect(200)
  .end(function(err, res) {
    t.error(err);

    t.ok(res.body.count > 0);
    t.equal(res.body.count, res.body.list.length);
    t.equal(res.body.limit, 0);
    t.equal(res.body.offset, 0);

    t.end();
  });
});

test('http: get user list (err-invalid offset)', function (t) {
  request(app)
  .get("/users?offset=no")
  .expect(400)
  .end(function(err, res) {
    t.error(err);

    t.deepEqual(res.body, {"error":{"message":"Validation failed","name":"ValidationError","errors":{"offset":{"path":"query:offset","message":"offset must be a number","type":"invalid-offset","value":null,"value_type":"number"}}}});

    t.end();
  });
});

test('http: get user list (err-invalid offset)', function (t) {
  request(app)
  .get("/users?offset=2&limit=no")
  .expect(400)
  .end(function(err, res) {
    t.error(err);

    t.deepEqual(res.body, {"error":{"message":"Validation failed","name":"ValidationError","errors":{"limit":{"path":"query:limit","message":"limit must be a number","type":"invalid-limit","value":null,"value_type":"number"}}}});

    t.end();
  });
});

test('http: get user list (err-invalid invalid sort)', function (t) {
  request(app)
  .get("/users?offset=2&limit=10&sort=noexistentfield")
  .expect(400)
  .end(function(err, res) {
    t.error(err);

    t.deepEqual(res.body, {"error":{"message":"Validation failed","name":"ValidationError","errors":{"sort":{"path":"query:sort","message":"not found in schema","type":"invalid-sort","label":null,"value":"noexistentfield","value_type":"string"}}}});

    t.end();
  });
});

test('http: get user list with offset/limit', function (t) {
  request(app)
  .get("/users?offset=0&limit=1")
  .expect(200)
  .end(function(err, res) {
    t.error(err);

    t.equal(res.body.list.length, 1);
    t.equal(res.body.limit, 1);
    t.ok(res.body.count > 0);

    t.end();
  });
});

test('http: get user list with offset/limit', function (t) {
  request(app)
  .get("/users/angular/list.tpl.html")
  .expect(200)
  .end(function(err, res) {
    t.error(err);

    var $ = cheerio.load(res.text);
    t.equal($("table").toArray().length, 1);
    // 5 fields + actions
    t.equal($("th").toArray().length, 6);
    t.equal($("td").toArray().length, 6);
    t.equal($("th").text(), "IDFirst NameLast nameAgeRoleActions");

    t.end();
  });
});

require("./finish.js");
