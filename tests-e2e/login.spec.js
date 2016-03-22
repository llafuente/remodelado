'use strict';

describe('login.spec.js', function() {
  var _ = require('./helpers.js')();

  it('go!', function() {
    _.go('/');
    _.click('#login');

    $('#login-username').sendKeys('admin@admin.com');
    $('#login-password').sendKeys('admin');
    _.click('#login-submit');

    expect($('#navbar-main').$$('li').count()).toBe(3);
  });
});
