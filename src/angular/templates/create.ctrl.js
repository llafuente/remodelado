'use strict';

angular
.module('<%= app_name %>')
.controller('<%= controllers.create_ctrl %>', function ($rootScope, $scope, $http, $state, confirmStateExit) {
  confirmStateExit($scope, "form.$dirty");

  $scope.entity = {
  }; // TODO defaults!

  $scope.submitting = false;

  $scope.submit = function() {
    if ($scope.submitting) return;

    $scope.submitting = true;
    $http({
      method: 'POST',
      url: '<%= api.create %>',
      data: $scope.entity,
    }).then(function() {
      $state.go("^.list");
    })
    .finally(function() {
      $scope.submitting = false;
    });
  }

  <%= controls_js %>;
});
