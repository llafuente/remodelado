'use strict';

var cheerio = require("cheerio");

// test
var request = require('supertest');
var test = require('tap').test;
var check_js = require('syntax-error');
var test_utils = require('../utils');

var app = require("../../server/express.js");
var config = require("../../server/config/index.js");
var api = require("../start.js")(test, app, config);

test('create user model', function(t) {
  var model = require("./test_model.model.json");
  var mdl = api.model(model);
  mdl.init();

  //console.log(
  //  require("util").inspect(mdl.json, {depth: null, colors: true})
  //);

  // schema check, ng-required must be a "true" string!
  t.equal(mdl.frontend.schema.first_name.constraints['ng-required'], "true");

  // url check
  t.equal(mdl.$express.urls.read, "/test_models/:test_model_id");
  t.equal(mdl.$express.urls.delete, "/test_models/:test_model_id");
  t.equal(mdl.$express.urls.update, "/test_models/:test_model_id");
  t.equal(mdl.$express.urls.create, "/test_models");
  t.equal(mdl.$express.urls.list, "/test_models");

  app.use(mdl.$router);

  test_utils.clear_and_add_permissions(api, mdl, t);
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

  test('http: create user', function(t) {
    request(app)
    .post("/test_models")
    .use(test_utils.authorization("admin@admin.com"))
    .send(u)
    .expect(201)
    .end(function(err, res) {
      console.log(res.body);
      t.type(res.body._id, "string", "_id is a string");
      t.type(res.body.id, "number", "id is a number");
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

      t.error(err);
      t.end();
    });
  });
});

test('http: create user (err)', function(t) {
  request(app)
  .post("/test_models")
  .send([1,2,3])
  .use(test_utils.authorization("admin@admin.com"))
  .expect(422)
  .end(function(err, res) {
    t.equal(res.body.error, "body is an array");

    t.error(err);
    t.end();
  });
});

test('http: create user (err-required)', function(t) {
  request(app)
  .post("/test_models")
  .use(test_utils.authorization("admin@admin.com"))
  .send({})
  .expect(400)
  .end(function(err, res) {

    t.deepEqual(res.body, {
      error: [
        {
          message: 'err-required',
          path: 'last_name',
          type: 'invalid-value',
          value_type: 'String',
          value_constraint: 'required',
          label: 'Last name'
        }, {
          message: 'err-required',
          path: 'first_name',
          type: 'invalid-value',
          value_type: 'String',
          value_constraint: 'required',
          label: 'First Name'
        }
      ]
    }, "error structure ok");

    t.error(err);
    t.end();
  });
});

test('http: create user (err-enum)', function(t) {
  request(app)
  .post("/test_models")
  .use(test_utils.authorization("admin@admin.com"))
  .send({
    first_name: 101,
    last_name: "Pérez",
    role: "chiwaka"
  })
  .expect(400)
  .end(function(err, res) {

    t.deepEqual(res.body, {
      error: [
        {
          "label": "Role",
          "message": "err-out-of-bounds",
          "path": "role",
          "type": "invalid-value",
          "value": "chiwaka",
          "value_constraint": "enum",
          "value_type": "String"
        }
      ]
    }, "error structure ok");

    t.error(err);
    t.end();
  });
});

test('http: create user (err-cast)', function(t) {
  request(app)
  .post("/test_models")
  .use(test_utils.authorization("admin@admin.com"))
  .send({
    first_name: "Manuel",
    last_name: "Pérez",
    age: "chiwaka"
  })
  .expect(400)
  .end(function(err, res) {
    t.deepEqual(res.body, {
      error: [
        {
          "label": "Age",
          "message": "cast-failed",
          "path": "age",
          "type": "invalid-type",
          "value": "chiwaka",
          "value_constraint": "cast",
          "value_type": "Number"
        }
      ]
    }, "error structure ok");

    t.error(err);
    t.end();
  });
});

test('http: get create user form', function(t) {
  request(app)
  .get("/angular/test_models.create.tpl.html")
  .expect(200)
  .end(function(err, res) {
    var $ = cheerio.load(res.text);
    t.equal($(".control-container").toArray().length, 5);

    t.error(err);
    t.end();
  });
});

test('http: get update user form', function(t) {
  request(app)
  .get("/angular/test_models.update.tpl.html")
  .expect(200)
  .end(function(err, res) {
    console.log(res.text);
    var $ = cheerio.load(res.text);
    // bio cannot be updated! -1
    t.equal($(".control-container").toArray().length, 4);

    t.error(err);
    t.end();
  });
});

test('http: get user routes.js', function(t) {
  request(app)
  .get("/angular/test_models.configuration.js")
  .expect(200)
  .end(function(err, res) {
    t.ok(res.text.length > 0);

    t.error(err);
    t.end();
  });
});

test('http: get user routes.js', function(t) {
  request(app)
  .get("/angular/test_models.configuration.js?base_state=root&action=update")
  .expect(200)
  .end(function(err, res) {
    t.ok(res.text.length > 0);

    t.error(err);
    t.end();
  });
});


test('http: get user list', function(t) {
  request(app)
  .get("/test_models")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    t.ok(res.body.count > 0);
    t.equal(res.body.count, res.body.list.length);
    t.equal(res.body.limit, 0);
    t.equal(res.body.offset, 0);

    t.error(err);
    t.end();
  });
});

test('http: get user list (with accesss token)', function(t) {
  request(app)
  .get("/test_models?access_token=" + test_utils.get_access_token("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    t.ok(res.body.count > 0);
    t.equal(res.body.count, res.body.list.length);
    t.equal(res.body.limit, 0);
    t.equal(res.body.offset, 0);

    t.error(err);
    t.end();
  });
});

test('http: get user list', function(t) {
  request(app)
  .get("/test_models")
  .use(test_utils.authorization("admin@admin.com"))
  .set('Accept', 'text/csv')
  .expect(200)
  .end(function(err, res) {
    t.equal(res.text.split("\n").length, 6); // 4 + headers + last

    t.error(err);
    t.end();
  });
});

test('http: get user list', function(t) {
  request(app)
  .get("/test_models?strict=true&limit=2")
  .use(test_utils.authorization("admin@admin.com"))
  .set('Accept', 'text/csv')
  .expect(200)
  .end(function(err, res) {
    t.equal(res.text.split("\n").length, 4); // 2 + headers + last

    t.error(err);
    t.end();
  });
});

test('http: get user list', function(t) {
  request(app)
  .get("/test_models?strict=true&limit=2")
  .use(test_utils.authorization("admin@admin.com"))
  .set('Accept', 'text/csv')
  .expect(200)
  .end(function(err, res) {
    t.equal(res.text.split("\n").length, 4); // 4 + headers + last
    // NOTE this test fail when more add more fields, don't worry
    t.equal(res.text.split(",").length, 22);

    t.error(err);
    t.end();
  });
});

test('http: get user list (separator)', function(t) {
  request(app)
  .get("/test_models?strict=true&limit=2&separator=;")
  .use(test_utils.authorization("admin@admin.com"))
  .set('Accept', 'text/csv')
  .expect(200)
  .end(function(err, res) {
    t.equal(res.text.split("\n").length, 4); // 4 + headers + last
    t.equal(res.text.split(",").length, 1);
    // NOTE this test fail when more add more fields, don't worry
    t.equal(res.text.split(";").length, 22);

    t.error(err);
    t.end();
  });
});

test('http: get user list (win newline)', function(t) {
  request(app)
  .get("/test_models?strict=true&limit=2&separator=;&newline=win")
  .use(test_utils.authorization("admin@admin.com"))
  .set('Accept', 'text/csv')
  .expect(200)
  .end(function(err, res) {
    t.equal(res.text.split("\r\n").length, 4); // 4 + headers + last
    t.equal(res.text.split(",").length, 1);
    // NOTE this test fail when more add more fields, don't worry
    t.equal(res.text.split(";").length, 22);

    t.error(err);
    t.end();
  });
});

test('http: get user list xml', function(t) {
  request(app)
  .get("/test_models?strict=true&limit=2")
  .use(test_utils.authorization("admin@admin.com"))
  .set('Accept', 'text/xml')
  .expect(200)
  .end(function(err, res) {
    // NOTE this test fail when more add more fields, don't worry
    t.equal(res.text.split("\n").length, 25);

    t.error(err);
    t.end();
  });
});

test('http: get user list xml', function(t) {
  request(app)
  .get("/test_models")
  .use(test_utils.authorization("admin@admin.com"))
  .set('Accept', 'text/xml')
  .expect(200)
  .end(function(err, res) {
    t.equal(res.text.split("\n").length, 49);

    t.error(err);
    t.end();
  });
});


test('http: get user list (err-invalid offset)', function(t) {
  request(app)
  .get("/test_models?offset=no")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(400)
  .end(function(err, res) {
    //t.deepEqual(res.body, {"error":{"message":"Validation failed","name":"ValidationError","errors":{"offset":{"path":"query:offset","message":"offset must be a number","type":"invalid-offset","value":null,"value_type":"number"}}}});
    t.deepEqual(res.body, {"error":[{"path":"query:offset","message":"offset must be a number","type":"invalid-offset","value":null,"value_type":"number"}]});

    t.error(err);
    t.end();
  });
});

test('http: get user list (err-invalid offset)', function(t) {
  request(app)
  .get("/test_models?offset=2&limit=no")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(400)
  .end(function(err, res) {
    t.deepEqual(res.body, {"error":[{"path":"query:limit","message":"limit must be a number","type":"invalid-limit","value":null,"value_type":"number"}]});

    t.error(err);
    t.end();
  });
});

test('http: get user list (err-invalid invalid where)', function(t) {
  request(app)
  .get("/test_models?offset=2&limit=10&where=dsajfs:true")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(400)
  .end(function(err, res) {
    t.deepEqual(res.body, {"error":[{"path":"query:where","message":"invalid where","type":"invalid-where","value":"dsajfs:true","value_type":"json_string"}]});

    t.error(err);
    t.end();
  });
});

test('http: get user list (err-invalid invalid sort)', function(t) {
  request(app)
  .get("/test_models?offset=2&limit=10&sort=noexistentfield")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(400)
  .end(function(err, res) {
    t.deepEqual(res.body, {"error":[{"path":"query:sort","message":"not found in schema","type":"invalid-sort","value":"noexistentfield","value_type":"string"}]});

    t.error(err);
    t.end();
  });
});

test('http: get user list with offset/limit', function(t) {
  request(app)
  .get("/test_models?offset=0&limit=1")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    t.equal(res.body.list.length, 1);
    t.equal(res.body.limit, 1);
    t.ok(res.body.count > 0);

    t.error(err);
    t.end();
  });
});

test('http: get user list (err invalid sort)', function(t) {
  request(app)
  .get("/test_models?sort=-restricted_field")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(400)
  .end(function(err, res) {
    t.deepEqual(res.body, {"error":[{"path":"query:sort","message":"field is restricted","type":"invalid-sort","value":"restricted_field","value_type":"string"}]});

    t.error(err);
    t.end();
  });
});

test('http: get user list (err invalid populate)', function(t) {
  request(app)
  .get("/test_models?populate[]=restricted_field")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(400)
  .end(function(err, res) {
    t.deepEqual(res.body, {"error":[{"path":"query:populate","message":"field cannot be populated","type":"invalid-populate","value":"restricted_field", "value_type": null}]});

    t.error(err);
    t.end();
  });
});

test('http: get user list (err invalid populate)', function(t) {
  request(app)
  .get("/test_models?populate=telephones")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(400)
  .end(function(err, res) {
    t.deepEqual(res.body, {"error":[{"path":"query:populate","message":"is not an array","type":"invalid-populate","value":"telephones","value_type":null}]});

    t.error(err);
    t.end();
  });
});

test('http: get user list (err invalid populate)', function(t) {
  request(app)
  .get("/test_models?populate[]=telephones")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(400)
  .end(function(err, res) {
    t.deepEqual(res.body, {"error":[{"path":"query:populate","message":"not found in schema","type":"invalid-populate","value":"telephones","value_type":null}]});

    t.error(err);
    t.end();
  });
});

test('http: get user list (err invalid populate)', function(t) {
  request(app)
  .get("/test_models?populate[]=first_name")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(400)
  .end(function(err, res) {
    t.deepEqual(res.body, {"error":[{"path":"query:populate","message":"field cannot be populated","type":"invalid-populate","value":"first_name","value_type":null}]});

    t.error(err);
    t.end();
  });
});

// TODO test a valid populate that it's restricted

test('http: get user list with first_name=abc', function(t) {
  request(app)
  .get("/test_models?where[first_name]=abc")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    t.equal(res.body.count, 1);
    t.equal(res.body.list.length, 1);

    t.error(err);
    t.end();
  });
});

test('http: get user list (err-invalid invalid where)', function(t) {
  request(app)
  .get("/test_models?where[noexistentfield]=text")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(400)
  .end(function(err, res) {
    t.deepEqual(res.body, {"error":[{"path":"query:where","message":"not found in schema","type":"invalid-where","value":"noexistentfield","value_type":null}]});

    t.error(err);
    t.end();
  });
});

var user_id;
test('http: get user list age=37', function(t) {
  request(app)
  .get("/test_models?where[age]=37&limit=1")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(200)
  .end(function(err, res) {
    t.equal(res.body.count, 2);
    t.equal(res.body.list.length, 1);

    user_id = res.body.list[0]._id;

    t.error(err);
    t.end();
  });
});

test('http: update user', function(t) {
  request(app)
  .patch("/test_models/" + user_id)
  .use(test_utils.authorization("admin@admin.com"))
  .send({
    last_name: "last!",
    no_exists: "do not update"
  })
  .expect(200)
  .end(function(err, res) {
    t.equal(res.body._id, user_id);
    t.equal(res.body.__v, undefined, "version is not exposed");

    t.error(err);
    request(app)
    .get("/test_models/" + user_id)
    .use(test_utils.authorization("admin@admin.com"))
    .expect(200)
    .end(function(err2, res2) {
      t.equal(res2.body._id, user_id);
      t.equal(res2.body.last_name, "last!");
      t.equal(res2.body.no_exists, undefined);
      t.isDate(res2.body.created_at);
      t.equal(res2.body.__v, undefined, "version is not exposed");

      t.error(err2);
      t.end();
    });
  });
});

test('http: update user (err)', function(t) {
  request(app)
  .patch("/test_models/" + user_id)
  .use(test_utils.authorization("admin@admin.com"))
  .send([1, 2, 3])
  .expect(422)
  .end(function(err, res2) {
    t.error(err);

    t.end();
  });
});

test('http: destroy user that don\'t exists (noerr?)', function(t) {
  request(app)
  .delete("/test_models/56b3683ce8b5ab05535c0e3f")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(204)
  .end(function(err, res2) {
    t.error(err);

    t.end();
  });
});

test('http: user not found', function(t) {
  request(app)
  .get("/test_models/56b3683ce8b5ab05535c0e3f")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(404)
  .end(function(err, res) {
    t.equal(res.body.error, "Not found");

    t.error(err);
    t.end();
  });
});



test('http: get user not-found', function(t) {
  request(app)
  .get("/test_models/123")
  .use(test_utils.authorization("admin@admin.com"))
  .expect(400)
  .end(function(err, res) {
    t.deepEqual(res.body, {"error":{"message":"cast-failed","value":"123","path":"_id","type":"invalid-type","value_constraint":"cast","value_type":"objectid"}});

    t.error(err);
    t.end();
  });
});

test('http: get user list template', function(t) {
  request(app)
  .get("/angular/test_models.list.tpl.html")
  .expect(200)
  .end(function(err, res) {

    var $ = cheerio.load(res.text);
    t.equal($("table").toArray().length, 1);
    // 5 fields + actions
    t.equal($("thead tr").first().find("th").toArray().length, 6);
    var headers = $("thead tr").first().find("th").text();
    // maybe div should back, leave the test here.
      //.split("\n")
      //.map(function(r) { return r.trim();})
      //.filter(function(r) { return r.length > 0;});
    //t.deepEqual(headers, ["ID", "First Name","Last name","Age","Role","Actions"]);
    t.equal(headers, "IDFirst NameLast nameAgeRoleActions");

    t.equal($("thead tr").last().find("th").toArray().length, 6);
    t.equal($("tbody tr td").toArray().length, 6);

    t.error(err);
    t.end();
  });
});

test('http: get user list controller', function(t) {
  request(app)
  .get("/angular/test_models.list.ctrl.js")
  .expect(200)
  .end(function(err, res) {
    t.ok(res.text.indexOf(".controller") != -1);

    t.equal(check_js(res.text), undefined);

    t.error(err);
    t.end();
  });
});

test('http: get user create controller', function(t) {
  request(app)
  .get("/angular/test_models.create.ctrl.js")
  .expect(200)
  .end(function(err, res) {
    t.ok(res.text.indexOf(".controller") != -1);

    t.equal(check_js(res.text), undefined);

    t.error(err);
    t.end();
  });
});

test('http: get user update controller', function(t) {
  request(app)
  .get("/angular/test_models.update.ctrl.js")
  .expect(200)
  .end(function(err, res) {
    t.ok(res.text.indexOf(".controller") != -1);

    t.equal(check_js(res.text), undefined);

    t.error(err);
    t.end();
  });
});

test('http: destroy user', function(t) {
  request(app)
  .delete("/test_models/" + user_id)
  .use(test_utils.authorization("admin@admin.com"))
  .expect(204)
  .end(function(err, res) {
    t.error(err);

    t.end();
  });
});

require("../finish.js");
