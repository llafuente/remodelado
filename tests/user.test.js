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
var check_js = require('syntax-error');

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
  t.equal(mdl.json.$express.read, "/users/:user_id");
  t.equal(mdl.json.$express.delete, "/users/:user_id");
  t.equal(mdl.json.$express.update, "/users/:user_id");

  t.equal(mdl.json.$express.create, "/users");
  t.equal(mdl.json.$express.list, "/users");

  app.use(mdl.router);

  mdl.model.remove({}, function() {
    t.end();
  });
});

[{
  first_name: "a ☃ ← 🐲",
  last_name: "DEF",
  age: 35
},{
  first_name: "b á ó",
  last_name: "JLK",
  age: 37
}, {
  first_name: "abc",
  last_name: "def",
  age: 37
}, {
  first_name: "abc2",
  last_name: "def3",
  age: 36,
  restricted_field: 101
}].forEach(function(u) {

  test('http: create user', function (t) {
    request(app)
    .post("/users")
    .send(u)
    .expect(201)
    .end(function(err, res) {
      t.error(err);

      t.type(res.body.id, "string", "id type");
      t.type(res.body.first_name, "string", "first_name type");
      t.type(res.body.last_name, "string", "last_name type");
      t.equal(res.body.first_name, u.first_name, "first_name value");
      t.equal(res.body.last_name, u.last_name, "last_name value");
      t.equal(res.body.age, u.age, "age value");
      t.equal(res.body.bio, null, "bio value");
      t.isDate(res.body.created_at, "created_at defined");
      t.isDate(res.body.updated_at, "updated_at defined");
      t.equal(res.body.__v, undefined, "version is not exposed");
      t.equal(res.body.restricted_field, undefined, "restricted_field is not exposed");

      t.end();
    });
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
  .get("/angular/users.create.tpl.html")
  .expect(200)
  .end(function(err, res) {
    t.error(err);

    var $ = cheerio.load(res.text);
    t.equal($(".control-container").toArray().length, 5);

    t.end();
  });
});

test('http: get update user form', function (t) {
  request(app)
  .get("/angular/users.update.tpl.html")
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
  .get("/angular/users.routes.js")
  .expect(200)
  .end(function(err, res) {
    t.error(err);

    t.ok(res.text.length > 0);

    t.end();
  });
});

test('http: get user routes.js', function (t) {
  request(app)
  .get("/angular/users.routes.js?base_state=root&action=update")
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

test('http: get user list (err invalid sort)', function (t) {
  request(app)
  .get("/users?sort=-restricted_field")
  .expect(400)
  .end(function(err, res) {
    t.error(err);

    t.deepEqual(res.body, {"error":{"message":"Validation failed","name":"ValidationError","errors":{"sort":{"path":"query:sort","message":"field is restricted","type":"invalid-sort","value":"restricted_field","value_type":"string"}}}});

    t.end();
  });
});

test('http: get user list (err invalid populate)', function (t) {
  request(app)
  .get("/users?populate=telephones")
  .expect(400)
  .end(function(err, res) {
    t.error(err);

    t.deepEqual(res.body, {"error":{"message":"Validation failed","name":"ValidationError","errors":{"populate":{"path":"query:populate","message":"is not an array","type":"invalid-populate","value":"telephones"}}}});

    t.end();
  });
});

test('http: get user list (err invalid populate)', function (t) {
  request(app)
  .get("/users?populate[]=telephones")
  .expect(400)
  .end(function(err, res) {
    t.error(err);

    t.deepEqual(res.body, {"error":{"message":"Validation failed","name":"ValidationError","errors":{"populate":{"path":"query:populate","message":"not found in schema","type":"invalid-populate","value":"telephones"}}}});

    t.end();
  });
});

test('http: get user list (err invalid populate)', function (t) {
  request(app)
  .get("/users?populate[]=first_name")
  .expect(400)
  .end(function(err, res) {
    t.error(err);
    //console.log(res.text);

    t.deepEqual(res.body, {"error":{"message":"Validation failed","name":"ValidationError","errors":{"populate":{"path":"query:populate","message":"field cannot be populated","type":"invalid-populate","value":"first_name"}}}});

    t.end();
  });
});

// TODO test a valid populate that it's restricted

test('http: get user list with first_name=abc', function (t) {
  request(app)
  .get("/users?where[first_name]=abc")
  .expect(200)
  .end(function(err, res) {
    t.error(err);

    t.equal(res.body.count, 1);
    t.equal(res.body.list.length, 1);

    t.end();
  });
});

var user_id;
test('http: get user list age=37', function (t) {
  request(app)
  .get("/users?where[age]=37&limit=1")
  .expect(200)
  .end(function(err, res) {
    t.error(err);

    t.equal(res.body.count, 2);
    t.equal(res.body.list.length, 1);

    user_id = res.body.list[0].id;
    t.end();
  });
});

test('http: update user', function (t) {
  request(app)
  .patch("/users/" + user_id)
  .send({
    last_name: "last!",
    no_exists: "do not update"
  })
  .expect(200)
  .end(function(err2, res2) {
    t.error(err2);

    t.equal(res2.body.id, user_id);
    t.equal(res2.body.__v, undefined, "version is not exposed");

    request(app)
    .get("/users/" + user_id)
    .expect(200)
    .end(function(err3, res3) {
      t.error(err3);

      t.equal(res3.body.id, user_id);
      t.equal(res3.body.last_name, "last!");
      t.equal(res3.body.no_exists, undefined);
      t.isDate(res3.body.created_at);
      t.equal(res3.body.__v, undefined, "version is not exposed");

      t.end();
    });
  });
});

test('http: update user (err)', function (t) {
  request(app)
  .patch("/users/" + user_id)
  .send([1, 2, 3])
  .expect(422)
  .end(function(err, res2) {
    t.error(err);

    t.end();
  });
});

test('http: destroy user that don\'t exists (noerr?)', function (t) {
  request(app)
  .delete("/users/56b3683ce8b5ab05535c0e3f")
  .expect(204)
  .end(function(err, res2) {
    t.error(err);

    t.end();
  });
});

test('http: user not found', function (t) {
  request(app)
  .get("/users/56b3683ce8b5ab05535c0e3f")
  .expect(404)
  .end(function(err, res) {
    t.error(err);

    t.deepEqual(res.body, {"error":"Not found"});

    t.end();
  });
});



test('http: get user not-found', function (t) {
  request(app)
  .get("/users/123")
  .expect(400)
  .end(function(err, res) {
    t.error(err);

    t.deepEqual(res.body, {"error":{"message":"cast-failed","value":"123","path":"_id","type":"invalid-type","value_constraint":"cast","value_type":"objectid"}});

    t.end();
  });
});

test('http: get user list template', function (t) {
  request(app)
  .get("/angular/users.list.tpl.html")
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

test('http: get user list controller', function (t) {
  request(app)
  .get("/angular/users.list.ctrl.js")
  .expect(200)
  .end(function(err, res) {
    t.error(err);

    t.ok(res.text.indexOf(".controller") != -1);

    t.equal(check_js(res.text), undefined);

    t.end();
  });
});

test('http: get user create controller', function (t) {
  request(app)
  .get("/angular/users.create.ctrl.js")
  .expect(200)
  .end(function(err, res) {
    t.error(err);

    t.ok(res.text.indexOf(".controller") != -1);

    t.equal(check_js(res.text), undefined);

    t.end();
  });
});

test('http: get user update controller', function (t) {
  request(app)
  .get("/angular/users.update.ctrl.js")
  .expect(200)
  .end(function(err, res) {
    t.error(err);

    t.ok(res.text.indexOf(".controller") != -1);

    t.equal(check_js(res.text), undefined);

    t.end();
  });
});

test('http: destroy user', function (t) {
  request(app)
  .delete("/users/" + user_id)
  .expect(204)
  .end(function(err, res) {
    t.error(err);

    t.end();
  });
});

require("./finish.js");
