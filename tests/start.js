"use strict";

var tap = require('tap');
var mongoose = require("mongoose");
var _ = require("lodash");
var modelador = require("../src/index.js");
var _async = require("async");
var api = null;
var test_utils = require("./utils.js");

tap.Test.prototype.addAssert('isDate', 1, function(str, message, extra) {
  message = message || 'should be a Date compatible type';

  return this.ok(!isNaN(Date.parse(str)), message, extra);
});

function create_user(data, next) {
  var admin = new api.models.user.$model(data);
  admin.setRequest({});
  admin.save(function(err, saved) {
    next(err, saved);
  });
}

module.exports = function(test, app, config) {
  if (!api) {
    api = new modelador(config, mongoose);
    app.use(api.$router);

    test('initialize api', function(t) {
      app.once('init', function() {
        api.init(function() {
          t.end();
        });
      });
    });
  }

  test('fixtures', function(t) {
    api.models.permissions.$model.find({}, function(err, perms) {
      var perms_ids = _.map(perms, '_id');

      api.models.roles.$model.remove({}, function(err) {
        t.error(err);
        api.models.roles.$model.create([{
          _id: 'administrator',
          label: "Administrator",
          permissions: perms_ids
        },{
          _id: 'readonly',
          label: "Reader",
          permissions: perms_ids.filter(function(v) {
            return v.indexOf("-read") !== -1 || v.indexOf("-list") !== -1;
          })
        }], function(err, roles) {
          t.error(err);

          api.models.user.$model.remove({}, function() {
            _async.each([{
              username: "admin@admin.com",
              password: "admin",
              roles: [roles[0]._id],
              data: {
                first_name: "Administrator"
              }
            }, {
              username: "reader@admin.com",
              password: "admin",
              roles: [roles[1]._id],
              data: {
                first_name: "Reader"
              }
            }, {
              username: "empty@admin.com",
              password: "admin",
              roles: [],
              data: {
                first_name: "Empty"
              }
            }], create_user, function(err) {
              t.error(err);
              t.end();
            });
          });
        });
      });
    });
  });

  test('login as admin@admin.com', function(t) {
    test_utils.login(app, "admin@admin.com", "admin", function(err, data) {
      t.error(err);
      t.end();
    });
  });

  test('login as reader@admin.com', function(t) {
    test_utils.login(app, "reader@admin.com", "admin", function(err, data) {
      t.error(err);
      t.end();
    });
  });

  test('login as empty@admin.com', function(t) {
    test_utils.login(app, "empty@admin.com", "admin", function(err, data) {
      t.error(err);
      t.end();
    });
  });



  return api;
};
