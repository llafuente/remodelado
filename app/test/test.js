'use strict';

angular
.module('app')
.config(function ($stateProvider) {
  $stateProvider
  .state('test', {
    url: '/test',
    templateUrl: 'test/test.tpl.html',
    controller: 'TestCtrl'
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
}]);
