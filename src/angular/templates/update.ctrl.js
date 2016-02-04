"use strict";

angular
.module('<%= app_name %>')
.controller('<%= controllers.update_ctrl %>', function ($rootScope, $scope, $http, entity) {
  $scope.entity = entity;
});
