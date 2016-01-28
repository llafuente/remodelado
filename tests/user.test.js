require("./start.js");

var remodelado = require("../src/index.js");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var app = require("./express.js");

// test
var request = require('supertest');
var test = require('tap').test;
var fs = require('fs');
var join = require('path').join;


test('create user model', function (t) {
  remodelado.use(mongoose);

  var model = require("./user.model.json");
  var mdl = remodelado.model(model);

  console.log(mdl.json.schema.first_name.$constraints);

  // schema check
  t.equal(mdl.json.schema.first_name.$constraints['ng-required'], true);


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
    if (err) { throw err; }

    t.type(res.body.id, "string", "id type");
    t.type(res.body.first_name, "string", "first_name type");
    t.type(res.body.last_name, "string", "last_name type");
    t.equal(res.body.first_name, "José Manuel", "first_name value");
    t.equal(res.body.last_name, "Pérez", "last_name value");
    t.equal(res.body.age, 35, "age value");
    t.equal(res.body.bio, null, "bio value");

    t.end();
  });
});

test('http: create user (err)', function (t) {
  request(app)
  .post("/users")
  .send([1,2,3])
  .expect(422)
  .end(function(err, res) {
    if (err) { throw err; }

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
    if (err) { throw err; }

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
    if (err) { throw err; }

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
    if (err) { throw err; }

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
  .get("/users/form")
  .expect(500)
  .end(function(err, res) {
    if (err) { throw err; }

    console.log(res.body);

    t.end();
  });
});


require("./finish.js");
