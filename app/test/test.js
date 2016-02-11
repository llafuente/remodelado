'use strict';

angular
.module('app')
.config(function ($stateProvider, $injector) {
  //var AuthenticateRouteDefer = $injector.get("AuthenticateRouteDefer");

  $stateProvider
  .state('test', {
    url: '/test',
    templateUrl: 'test/test.tpl.html',
    controller: 'TestCtrl'
  })
  .state('test.bootstrap', {
    url: '/auth',
    templateUrl: 'test/bootstrap.tpl.html',
    resolve: {}
  })
  .state('test.auth_required', {
    url: '/auth',
    template: '<ui-view></ui-view>',
    authenticate: true,
    resolve: {}
  })
  .state('test.auth_required.ok', {
    url: '/auth',
    templateUrl: 'test/auth_ok.tpl.html',
    authenticate: true,
    resolve: {}
  })
  .state('test.auth_required_defer', {
    url: '/auth-defer',
    templateUrl: 'test/auth_ok.tpl.html',
    controller: 'TestCtrl',
    resolve: {}
  });
})
.config(function(ErrorConfigProvider) {
  ErrorConfigProvider.templates.retryable = 'test/error-retryable.tpl.html';
})
.controller('TestCtrl', ["$scope", "$http", function($scope, $http) {
  $scope.single_error = function() {
    $http.get('/api/error-single/500')
    .success(function() {
      console.log("error-single: success");
    })
    .error(function() {
      console.log("error-single: error");
    })
    .finally(function() {
      console.log("error-single: finally");
    });
  };

  $scope.list_error = function() {
    $http.get('/api/error-list/500');
  };

  $scope.tpl_error = function() {
    $http.get('/api/error-template/500');
  };

  $scope.required_login = function() {
    $http.get('/api/require-login');
  };

  $scope.session_expired = function() {
    $http.get('/api/expire-my-session');
  };


}]);
