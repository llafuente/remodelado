var tap = require('tap');
var test = tap.test;
var mongoose = require("mongoose");

test('close mongoose', function (t) {
  mongoose.disconnect();
  t.end();
});
