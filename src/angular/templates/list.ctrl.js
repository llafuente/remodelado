"use strict";

angular
.module('<%= app_name %>')
.controller('<%= name %>ListCtrl', function ($rootScope, $scope, $http, list) {
  $scope.list = list;
});
