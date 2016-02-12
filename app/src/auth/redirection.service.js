//redirectTo
//redirectToParams
angular
.module('app')
.provider('Redirection', function() {
  // url that return user data
  this.state = {
    name: null,
    params: {}
  };

  this.$get = function () {
    return this;
  };
})
.factory("RedirectToLogin", function($state, Redirection) {
  return function(name, params) {
    if (!name) {
      name = Redirection.state.name;
      params = Redirection.state.params;
    }

    $state.go("login", {
      redirectTo: name,
      redirectToParams: JSON.stringify(params || {}),
    });
  };
})
.run(function ($rootScope, $state, $log, Auth, Redirection, RedirectToLogin) {
  $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
    if (toState.name != "login" && toState.name != "error") {
      Redirection.state.name = toState.name;
      Redirection.state.params = toParams;
    }
  });

  $rootScope.$on("$stateChangeError", function (event, toState, toParams) {
    $log.error("$stateChangeError", arguments);

    // go to error state to stop inifite loop
    // if has session is a error that won't redirect to login, so goto error
    if (Auth.isLoggedIn()) {
      $state.go("error");
    } else {
      RedirectToLogin(toState.name, toParams);
    }
  });

  $rootScope.$on("$stateNotFound", function (event, unfoundState, fromState, fromParams) {
    $log.error("$stateNotFound", arguments);
    $state.go("error");
  });
});
