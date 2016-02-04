"use strict";

angular
.module('<%= app_name %>')
.controller('<%= controllers.create_ctrl %>', function ($rootScope, $scope, $http) {
  $scope.entity = {
  }; // TODO defaults!

  <%= controls_js %>;
});
