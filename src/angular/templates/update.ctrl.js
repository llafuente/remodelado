"use strict";

angular
.module('<%= app_name %>')
.controller('<%= controllers.update_ctrl %>', function ($rootScope, $scope, $http, entity, $state, $stateParams) {
  $scope.entity = entity;

  $scope.submit = function() {
    if ($scope.submitting) return;

    // TODO gather only changes!

    $scope.submitting = true;
    $http({
      method: 'PATCH',
      url: '<%= api.update %>/'.replace(':<%= id_param %>', $stateParams['<%= id_param %>']),
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
