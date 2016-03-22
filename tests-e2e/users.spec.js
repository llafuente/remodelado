'use strict';

describe('users.spec.js', function() {
  var _ = require('./helpers.js')();

  it('users - list', function() {
    _.go('#/users/list');

    expect($('table#users').$$('tr.headers th').count()).toBe(6);

    expect($('table#users').$$('tr.filters th input').count()).toBe(4);
    expect($('table#users').$$('tr.filters th select').count()).toBe(2);

    expect($('#users-filter-roles').$$('option').count()).toBe(3);
    expect($('#users-filter-state').$$('option').count()).toBe(3);
  });

  it('users - create', function() {
    _.click_text('Crear new user');

    expect($('form').$$('.control-container').count()).toBe(4);

    $('#control-username').sendKeys('admin2@admin.com');
    $('#control-password').sendKeys('admin');

    expect($('#permissions-container').$$('input').count()).toBe(25);
    $('#roles-0').click();

    _.click_text('Create user');
  });

  it('users - created', function() {
    var tr = $('table#users').$$('tbody tr').get(2);
    expect(tr.$$('td').get(1).getText()).toBe('admin2@admin.com');
    expect(tr.$$('td').get(2).getText()).toBe('Administrator');
    expect(tr.$$('td').get(3).getText()).toBe('Active');
  });

  it('users - update', function() {
    $('table#users').$$('tbody tr').get(2).$('.entity-update').click();
    $('#control-username').clear().sendKeys('admin3@admin.com');
    //TODO this must be removed, allow constraints per update/create
    $('#control-password').clear().sendKeys('admin');

    _.click_text('Save user');
    browser.sleep(1000);
  });

  it('users - created 2', function() {
    var tr = $('table#users').$$('tbody tr').get(2);
    expect(tr.$$('td').get(1).getText()).toBe('admin3@admin.com');
    expect(tr.$$('td').get(2).getText()).toBe('Administrator');
    expect(tr.$$('td').get(3).getText()).toBe('Active');
    browser.sleep(5000);
  });


});
