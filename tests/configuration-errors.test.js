'use strict';

// test
var test = require('tap').test;
var app = require("../server/express.js");
var config = require("../server/config/index.js");
var api = require("./start.js")(test, app, config);

test('create model error 01', function(t) {
  t.plan(1);
  t.throws(function() {
    console.log("???");
    api.model({
      "singular": "user",
      "backend": {
        "permissions": {},
        "schema": {
          "id": {
            "label": "ID",
            "type": "number"
          },
          "permissions": {
            "label": "Permissions",
            "type": "array",
            "array": {
              "type": "ObjectId",
              "ref": "permissions"
            }
          }
        }
      },
      "frontend": {
        "navbar": {
          "label": "Users"
        },
        "list": {
          "id": {
            "type": "number"
          }
        },
        "schema": {
          "id": {
            "type": "static",
            "create": false,
            "update": true
          },
          "permissions": {
            "type": "checklist",
            /*
            "source_url": {
              "method": "GET",
              "url": "/api/permissions"
            }
            */
          }
        }
      }
    });
  });
});

require("./finish.js");
