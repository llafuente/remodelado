'use strict';


// factory fast access via $rootScope.auth
// current user: $rootScope.user
// emit $logout & $login event to rootScope
angular
.module('app')
.provider("AuthConfig", function () {
  // url that return user data
  this.api_users_data = '/api/users/me';
  // url that return the token
  this.api_auth = '/api/auth';
  this.state_after_login = 'users';
  this.token_header = 'X-Access-Token';
  this.token_prefix = 'Bearer ';
  this.cookie_name = 'token';
  // if this header is recieve with an error -> logout the user
  this.expiration_header = 'X-Session-Expired';

  this.$get = function () {
    return this;
  };
})
.factory('Auth', function Auth($location, $rootScope, $http, ipCookie, $state, chainLoading, $log, AuthConfig) {
  var currentUser = {};

  function setCurrentUser(val) {
    $log.debug("(Auth) setCurrentUser");

    $rootScope.user = val;
    currentUser = val;
  }

  function login_me() {
    return $http({
      method: 'POST',
      url: AuthConfig.api_users_data
    })
    .then(function(response) {
      setCurrentUser(response.data);
      $rootScope.$emit('$login');
    });
  }

  function get_token() {
    return ipCookie(AuthConfig.cookie_name);
  }
  function set_token(data) {
    ipCookie(AuthConfig.cookie_name, data, {
      path: '/'
    });
  }
  function remove_token(data) {
    ipCookie.remove('token', {
      path: '/'
    });
  }

  $log.debug("(Auth) Token", get_token());

  if(get_token()) {
    login_me();
  }


  return ($rootScope.Auth = {

    /**
     * Authenticate user and save token
     *
     * @param  {Object}   user     - login info
     * @return {Promise}
     */
    login: function(username, password, remindme) {
      var promise = $http({
        method: "POST",
        url: AuthConfig.api_auth,
        data: {
          username: username,
          password: password,
          remindme: remindme || false
        }
      })
      .then(function(response) {
        $log.debug("(Auth) login success", response.data);

        set_token(response.data.token);

        return login_me().then(function() {
          return response;
        });
      }, function(response) {
        $log.debug("(Auth) login err", response);
        this.logout();

        return response;
      }.bind(this));

      chainLoading(promise);

      return promise;
    },

    /**
     * logout first, call logout API later
     * $emit $logout event to $rootScope after the api call
     *
     * @param  {Boolean}
     */
    logout: function(redirect_to) {
      setCurrentUser({});
      var token = get_token();
      remove_token();

      if (token) {
        var headers = {};
        headers[AuthConfig.token_header] = token;
        chainLoading($http({
          method: 'POST',
          url: '/api/logout',
          headers: headers
        })
        .finally(function(response){
          // TODO review if this is the best site
          $rootScope.$emit('$logout');

          if (redirect_to) {
            $log.debug('redirect logout', redirect_to);

            $state.go(redirect_to);
          }
        }));
      }
    },

    /**
     * Gets all available info on authenticated user
     *
     * @return {Object} user
     */
    getCurrentUser: function() {
      return currentUser;
    },

    /**
     * Check if a user is logged in
     *
     * @return {Boolean}
     */
    isLoggedIn: function() {
      return currentUser.hasOwnProperty('id');
    },

    /**
     * Waits for currentUser to resolve before checking if user is logged in
     */
    isLoggedInAsync: function(cb) {
      //$log.debug("(Auth) isLoggedInAsync", currentUser);

      if(currentUser.hasOwnProperty('$promise')) {
        currentUser.$promise.then(function() {
          cb(true);
        }).catch(function() {
          cb(false);
        });
      } else if(currentUser.hasOwnProperty('id')) {
        cb(true);
      } else {
        cb(false);
      }
    },

    hasRoles: function(roles) {
      if (!currentUser || !currentUser.roles) {
        return false;
      }

      if ('string' === typeof roles) {
        roles = [roles];
      }
      return roles.every(function(role) {
        return currentUser ? currentUser.roles.indexOf(role) !== -1 : false;
      });
    },

    hasPermissions: function(perms) {
      if (!currentUser || !currentUser.permissions) {
        return false;
      }

      if ('string' === typeof perms) {
        perms = [perms];
      }
      return perms.every(function(perm) {
        return currentUser ? currentUser.permissions.indexOf(perm) !== -1 : false;
      });
    },

    /**
     * Get auth token
     */
    getToken: get_token
  });
})
.factory('authInterceptor', function ($injector, $q) {
  return {
    // Add authorization token to headers
    request: function (config) {
      var AuthConfig = $injector.get("AuthConfig");
      var Auth = $injector.get("Auth");
      config.headers = config.headers || {};
      var t = Auth.getToken();
      if (t) {
        config.headers[AuthConfig.token_header] = AuthConfig.token_prefix + t;
      }
      return config;
    },
    responseError: function (response) {
      var AuthConfig = $injector.get("AuthConfig");
      var Auth = $injector.get("Auth");

      if (response.headers(AuthConfig.expiration_header)){
        Auth.logout();
      }

      return $q.reject(response);
    }
  };
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
})
// just run it so it can autologin
.run(function(Auth) {})
