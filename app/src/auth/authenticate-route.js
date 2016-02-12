// on $stateChangeStart check if a parent has 'authenticate:true'
// if it does, put AuthenticateRouteResolve in the resolve

// this method works
// this maybe more elegant: https://github.com/angular-ui/ui-router/issues/1165#issuecomment-164897856
// for the future...
angular
.module('app')
.factory('AuthenticateRouteResolve', function(Auth, $q, $state, $log, $timeout, RedirectToLogin) {
  return function AuthenticateRouteDeferCB() {
    $log.debug("(AuthenticateRoute) state require auth");
    var defer = $q.defer();

    Auth.isLoggedInAsync(function(loggedIn) {
      $log.debug("(AuthenticateRoute) user auth?", !!loggedIn);
      defer.resolve();
      if (!loggedIn) {
        $timeout(function() {
          RedirectToLogin();
        });
      }
    });

    return defer.promise;
  };
})
// Add resolve function if needed to state on $stateChangeStart
.factory('AuthenticateRoute', function(Auth, $state, $log, $q, AuthenticateRouteResolve) {
  return function (event, toState, toParams, fromState, fromParams) {
    var require_auth = false;
    var path = toState.name.split(".");
    var i = 0;
    var s;

    for (; i < path.length; ++i) {
      s = $state.get(path.slice(0, i +1).join("."));

      if (s.authenticate) {
        require_auth = true;
      }
    }

    if (require_auth) {
      if (undefined === toState.resolve) {
        $log.error("(AuthenticateRoute)", toState.name, "need a resolve: add resolve:{}");
        return;
      }
      toState.resolve =toState.resolve || {};
      toState.resolve.authenticate = AuthenticateRouteResolve;
    }
  };
})
.run(function ($rootScope, AuthenticateRoute) {
  $rootScope.$on('$stateChangeStart', AuthenticateRoute);
});
