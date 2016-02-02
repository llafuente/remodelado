"use strict";

angular
.module('<%= app_name %>')
.controller('<%= controllers.list %>', function ($rootScope, $scope, $http, list) {
  $scope.list = list;
});
