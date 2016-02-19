'use strict';

describe('login.spec.js', function() {
  var _ = require('./helpers.js')();

  it('go!', function() {
    _.go("/");
    $("#login").click();
    $("#login-username").sendKeys('a');
    $("#login-password").sendKeys('b');
    $("#login-submit").click();
    browser.sleep(5000);
  });
});
