var tap = require('tap');
var mongoose = require("mongoose");
var _ = require("lodash");
var api = require("../src/index.js");
var _async = require("async");

tap.Test.prototype.addAssert('isDate', 1, function (str, message, extra) {
  message = message || 'should be a Date compatible type';

  return this.ok(!isNaN(Date.parse(str)), message, extra);
});

function create_user(data, next) {
  var admin = new api.models.user.$model(data);
  admin.setRequest({});
  admin.save(function(err, saved) {
    console.log("saved", saved);
    next(err, saved);
  });
}

module.exports = function(test) {
  test('fixtures', function (t) {
    api.use(mongoose);

    api.models.permissions.$model.find({}, function(err, perms) {
      var perms_ids = _.map(perms, '_id');

      api.models.user.$model.remove({}, function() {
        _async.each([{
          username: "admin@admin.com",
          password: "admin",
          permissions: perms_ids
        }, {
          username: "reader@admin.com",
          password: "admin",
          permissions: perms_ids.filter(function(v) {
            return v.indexOf("/read") !==- 1
          })
        }], create_user, function(err) {
          t.error(err);
          t.end();
        });
      });



    });
  });
}
