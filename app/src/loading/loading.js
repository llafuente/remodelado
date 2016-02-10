'use strict';

// hook ui-router and httpProvider supporting loading screens
// without any verbose code

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
  var defer = null;

  $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
    $log.info("$stateChangeStart", toState.name);
    if (!defer) {
      defer = chainLoadingQ();
    }
  });

  $rootScope.$on("$stateChangePrevented", function(event, toState, toParams, fromState, fromParams) {
    $log.info("$stateChangePrevented", toState.name);
    if (defer) {
      defer.resolve();
      defer = null;
    }
  });
  $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
    $log.info("$stateChangeSuccess", toState.name);
    if (defer) {
      defer.resolve();
      defer = null;
    }
  });

  $rootScope.$on("$stateChangeError", function (event, tostate, toparams) {
    $log.error("$stateChangeError", arguments);
    if (defer) {
      defer.resolve();
      defer = null;
    }
  });

  $rootScope.$on("$stateNotFound", function (event, unfoundState, fromState, fromParams) {
    $log.error("$stateNotFound", arguments);
    if (defer) {
      defer.resolve();
      defer = null;
    }
  });
})
.factory('HttpLoadingInterceptor', function ($q, $rootScope, $log, chainLoadingQ) {
  var numLoadings = 0;
  var defer = null;

  return {
    request: function (config) {
      numLoadings++;

      if (numLoadings == 1) {
        defer = chainLoadingQ();
      }

      // Show loader
      $rootScope.$broadcast("$loading");
      return config;
    },
    response: function (response) {
      if ((--numLoadings) === 0) {
        // Hide loader
        $rootScope.$broadcast("$loaded");
        defer.resolve();
      }

      return response;
    },
    responseError: function (response) {
      if (!(--numLoadings)) {
        // Hide loader
        $rootScope.$broadcast("$loaded");
        defer.resolve();
      }

      return $q.reject(response);
    }
  };
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('HttpLoadingInterceptor');
});
