'use strict';
// app initialization
angular
.module('app', [
  'ui.bootstrap',
  'ui.router',
  'smart-table',
  'ipCookie',
  'cgBusy',
  'checklist-model'
])
.filter('translate', function () {
  return function(x) { return x; };
})

.config(function (navbarLeftProvider) {
  navbarLeftProvider.push(99, {
    name: "Test",
    state: "test",
    subtree: [{
      name: "Injectors/modals",
      state: "test"
    },{
      name: "Form (dirty-modal)",
      state: "test.form"
    },{
      name: "Private section",
      state: "test.auth_required.ok"
    },{
      name: "Private section (with err)",
      state: "test.auth_required.ko"
    }, {
      name: "Bootstrap",
      state: "test.bootstrap"
    }]
  });
})
.controller('RootCtrl', function ($rootScope, $scope, $state, $http, $timeout, navbarLeft) {
  navbarLeft.sort();
  console.log(navbarLeft.tree);
  $rootScope.tl_navbar = navbarLeft.tree;
})

.config(function (rewriteRequestConfigProvider) {
  //rewriteRequestConfigProvider.start_with['/api'] = "/jwt/v1";
})
.config(function ($stateProvider, $injector) {
  //var AuthenticateRouteDefer = $injector.get("AuthenticateRouteDefer");

  $stateProvider
  .state('test', {
    url: '/test',
    templateUrl: 'test/test.tpl.html',
    controller: 'TestCtrl'
  })
  .state('test.bootstrap', {
    url: '/bootstrap',
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
    url: '/ok',
    templateUrl: 'test/auth_ok.tpl.html',
    authenticate: true,
    resolve: {}
  })
  .state('test.auth_required.ko', {
    url: '/ko',
    templateUrl: 'test/auth_ok.tpl.html',
    controller: 'TestCtrl',
    resolve: {
      err: ["$http", function($http) {
        return $http.get("/api/error-if-logged");
      }]
    }
  })
  .state('test.form', {
    url: '/form',
    templateUrl: 'test/form.tpl.html',
    controller: 'FormCtrl'
  });
})
.config(function(errorConfigProvider) {
  errorConfigProvider.templates.retryable = 'test/error-retryable.tpl.html';
})
.controller('FormCtrl', ["$scope", "confirmStateExit", function($scope, confirmStateExit) {
  confirmStateExit($scope, 'form.$dirty');

  $scope.entity = {};
}])
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
