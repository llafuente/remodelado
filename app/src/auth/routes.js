'use strict';

angular
.module('app')
.config(function ($stateProvider) {
  $stateProvider
  .state('login', {
    url: '/login?redirectTo&redirectToParams',
    templateUrl: 'src/auth/login.tpl.html',
    controller: 'LoginCtrl'
  });
})
