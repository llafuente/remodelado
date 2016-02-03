"use strict";

angular
.module('<%= app_name %>')
.controller('<%= controllers.list_ctrl %>', function ($rootScope, $scope, $http, list) {
  $scope.list = list;
});
