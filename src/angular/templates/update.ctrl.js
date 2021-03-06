"use strict";

angular
.module('<%= app_name %>')
.controller('<%= controllers.update_ctrl %>', function ($rootScope, $scope, $http, entity, $state, $stateParams, confirmStateExit, $log, $injector) {
  confirmStateExit($scope, "form.$dirty && !submitted");

  $scope.crud_action = 'update';
  $scope.entity = entity;
  $scope.submitted = false;
  $scope.submitting = false;

  $scope.submit = function() {
    if ($scope.submitting) return;

    // TODO gather only changes!

    $scope.submitting = true;
    $http({
      method: 'PATCH',
      url: '<%= api.urls.update %>/'.replace(':<%= api.id_param %>', $stateParams['<%= api.id_param %>']),
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
