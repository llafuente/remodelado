'use strict';

angular
.module('app')
.factory('chainLoading', function($rootScope) {
  return function chainLoading(promise) {
    if (!$rootScope.loading || $rootScope.loading.$$state.status == 1) {
      $rootScope.loading = promise;
    } else {
      $rootScope.loading = $rootScope.loading.then(function() { return promise; });
    }

    return $rootScope.loading;
  };
})
.factory('chainLoadingQ', function($rootScope, $q) {
  return function chainLoading() {
    var defer = $q.defer();
    if (!$rootScope.loading || $rootScope.loading.$$state.status == 1) {
      $rootScope.loading = defer.promise;
    } else {
      $rootScope.loading = $rootScope.loading.then(function() { return defer.promise; });
    }
    return defer;
  };
})
// state change -> loading!
.run(function ($rootScope, chainLoadingQ, $log) {
  var defers = [];
  var defer;

  $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
    $log.info("$stateChangeStart", toState.name);
    defers.push(chainLoadingQ());
  });

  function resolve_all (/*event, toState, toParams, fromState, fromParams*/) {
    //$log.info("$stateChangeSuccess", arguments, defers.length);
    while(defer = defers.pop()) {
      defer.resolve();
    }
    $rootScope.loading = null;
  }

  $rootScope.$on("$stateChangePrevented", function(event, toState, toParams, fromState, fromParams) {
    $log.info("$stateChangePrevented", toState.name);
    resolve_all();
  });
  $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
    $log.info("$stateChangeSuccess", toState.name);
    resolve_all();
  });

  $rootScope.$on("$stateChangeError", function (event, tostate, toparams) {
    $log.error("$stateChangeError", arguments);
    resolve_all();
  });

  $rootScope.$on("$stateNotFound", function (event, unfoundState, fromState, fromParams) {
    $log.error("$stateNotFound", arguments);
  });
});
