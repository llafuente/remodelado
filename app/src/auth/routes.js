'use strict';

angular
.module('app')
.config(function ($stateProvider) {
  $stateProvider
  .state('login', {
    url: '/login?redirectTo&redirectToParams',
    templateUrl: 'src/auth/login.tpl.html',
    controller: 'LoginCtrl',
    /* delay to test cg-busy
    resolve: {
      data: function($q) {
        var defer = $q.defer();

        setTimeout(function() {
          defer.resolve();
        }, 5000);

        return defer.promise;
      }
    }
    */
  });
})
