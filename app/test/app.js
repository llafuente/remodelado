'use strict';
// app initialization
angular
.module('app', [
  'ui.bootstrap',
  'ui.router',
  'smart-table',
  'ipCookie',
  'cgBusy',
  'checklist-model',
  'angular-confirm'
])
.filter('translate', function () {
  return function(x) { return x; };
})
.controller('RootCtrl', function ($rootScope, navbarLeft, $log) {
  navbarLeft.sort();
  $log.debug("(navbarLeft)", navbarLeft.tree);
  $rootScope.tl_navbar = navbarLeft.tree;
})
.config(function (rewriteRequestConfigProvider) {
  //rewriteRequestConfigProvider.start_with['/api'] = "/jwt/v1";
})
.config(function(errorConfigProvider) {
  //errorConfigProvider.templates.retryable = 'test/error-retryable.tpl.html';
});
