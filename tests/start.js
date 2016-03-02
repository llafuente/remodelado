var tap = require('tap');
var mongoose = require("mongoose");
var api = require("../src/index.js");

tap.Test.prototype.addAssert('isDate', 1, function (str, message, extra) {
  message = message || 'should be a Date compatible type';

  return this.ok(!isNaN(Date.parse(str)), message, extra);
});

module.exports = function(test) {
  test('fixtures', function (t) {
    api.use(mongoose);

    api.models.user.$model.remove({}, function() {
      var admin = new api.models.user.$model({
        username: "admin@admin.com",
        password: "admin"
      });
      admin.setRequest({});
      admin.save(function(err, saved) {
        console.log("saved", saved);
        t.end();
      });
    });
  });
}
