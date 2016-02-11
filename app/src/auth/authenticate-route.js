// on $stateChangeStart check if a parent has 'authenticate:true'
// if it does, put AuthenticateRouteResolve in the resolve
angular
.module('app')
.factory('AuthenticateRouteResolve', function(Auth, $q, $state) {
  return function AuthenticateRouteDeferCB() {
    $log.log("(AuthenticateRoute) state require auth");
    var defer = $q.defer();

    Auth.isLoggedInAsync(function(loggedIn) {
      $log.log("(AuthenticateRoute) user auth?", !!loggedIn);
      defer.resolve();
      if (!loggedIn) {
        // this doesn't seem to be necessary
        // http 401 interceptor do the redirect too...
        // TODO !!RedirectToLogin("login redirect auth_required");
        $state.go("login");
      }
    });

    return defer.promise;
  };
})
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
