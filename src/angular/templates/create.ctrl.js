'use strict';

angular
.module('<%= app_name %>')
.controller('<%= controllers.create_ctrl %>', function ($rootScope, $scope, $http, $state, confirmStateExit, $log, $injector) {
  confirmStateExit($scope, "form.$dirty && !submitted");

  $scope.crud_action = 'create';
  $scope.entity = {
  }; // TODO defaults!

  $scope.submitted = false;
  $scope.submitting = false;

  $scope.submit = function() {
    if ($scope.submitting) return;

    $scope.submitting = true;
    $http({
      method: 'POST',
      url: '<%= api.urls.create %>',
      data: $scope.entity,
    }).then(function() {
      $scope.submitted = true;
      $state.go("^.list");
    })
    .finally(function() {
      $scope.submitting = false;
    });
  }

  <%= controls_js %>;
});
