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
  'angular-confirm',
  'ngSanitize'
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
})
.config(function(errorConfigProvider, authConfigProvider, rewriteRequestConfigProvider) {
  authConfigProvider.token_header = 'Authorization';
  authConfigProvider.api_users_data = '/users/me';
  authConfigProvider.api_auth = '/auth';
})
.directive('ngBindHtmlAndCompile', ['$compile', '$parse', '$sce', '$timeout', function ($compile, $parse, $sce, $timeout) {
  return {
    restrict: 'A',
    compile: function ngBindHtmlCompile(tElement, tAttrs) {
      var ngBindHtmlGetter = $parse(tAttrs.ngBindHtmlAndCompile);
      var ngBindHtmlWatch = $parse(tAttrs.ngBindHtmlAndCompile, function getStringValue(value) {
        return (value || '').toString();
      });
      $compile.$$addBindingClass(tElement);

      return function ngBindHtmlLink(scope, element, attr) {
        $compile.$$addBindingInfo(element, attr.ngBindHtmlAndCompile);

        scope.$watch(ngBindHtmlWatch, function ngBindHtmlWatchAction() {
          // we re-evaluate the expr because we want a TrustedValueHolderType
          // for $sce, not a string
          element.html($sce.getTrustedHtml(ngBindHtmlGetter(scope)) || '');
          $timeout(function() {
            $compile(element.contents())(scope);
          });
        });
      };
    }
  };
}]);
