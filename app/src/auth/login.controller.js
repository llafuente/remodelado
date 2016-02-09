'use strict';

angular
.module('app')
.controller('LoginCtrl', function ($scope, Auth, $state, $stateParams, AuthConfig) {
  $scope.user = {};
  $scope.errors = {};
  $scope.submitted = false;
  $scope.hidden = true;

  // Logged in, redirect to home
  function redirect() {
    if ($stateParams.redirectTo) {
      var p;
      try {
        p = JSON.parse($stateParams.redirectToParams);
      }catch(e) { console.log(e); p = null; }

      $state.go($stateParams.redirectTo, p);
    } else {
      $state.go(AuthConfig.state_after_login);
    }
  }

  Auth.isLoggedInAsync(function(logged) {
    if (logged) {
      return redirect();
    }
    $scope.hidden = false;
  });

  $scope.login = function(form) {
    $scope.submitted = true;

    if(form.$valid) {
      Auth.login(
        $scope.user.email,
        $scope.user.password,
        $scope.user.remindme
      )
      .success(function() {
        return redirect();
      });
    }
  };

});
