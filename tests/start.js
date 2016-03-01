var tap = require('tap');
var test = tap.test;
var mongoose = require("mongoose");

tap.Test.prototype.addAssert('isDate', 1, function (str, message, extra) {
  message = message || 'should be a Date compatible type';

  return this.ok(!isNaN(Date.parse(str)), message, extra);
});
