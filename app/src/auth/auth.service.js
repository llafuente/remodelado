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

  this.$get = function () {
    return this;
  };
})
.factory('Auth', function Auth($location, $rootScope, $http, ipCookie, $state, chainLoading, $log, AuthConfig) {
  var currentUser = {};

  function setCurrentUser(val) {
    $rootScope.user = val;
    currentUser = val;
  }

  function login_me() {
    $log.info("login_me")
    var user = $http({
      method: 'POST',
      url: AuthConfig.api_users_data
    });

    user.then(function(response) {
      setCurrentUser(response.data);
      $rootScope.$emit('$login');
    });

  }

  if(ipCookie('token')) {
    login_me();
  }

  $log.log("Token", ipCookie('token'));

  return ($rootScope.Auth = {

    /**
     * Authenticate user and save token
     *
     * @param  {Object}   user     - login info
     * @param  {Function} callback - optional
     * @return {Promise}
     */
    login: function(username, password, remindme, callback) {
      var cb = callback || angular.noop;

      return chainLoading($http.post(AuthConfig.api_auth, {
        username: username,
        password: password,
        remindme: remindme || false
      }).
      success(function(data) {
        $log.log("login success", data);

        ipCookie('token', data.token, {
          path: '/'
        });

        login_me();

        return cb();
      }).
      error(function(err) {
        this.logout();

        return cb(err);
      }.bind(this)));
    },

    /**
     * logout first, call logout API later
     * $emit $logout event to $rootScope after the api call
     *
     * @param  {Boolean}
     */
    logout: function(redirect_to) {
      setCurrentUser({});
      var token = ipCookie('token');
      ipCookie.remove('token', {
        path: '/'
      });

      if (token) {
        chainLoading($http({
          method: 'POST',
          url: '/api/logout',
          headers: {
            'X-Access-Token': token
          }
        })
        .finally(function(response){
          // TODO review if this is the best site
          $rootScope.$emit('$logout');

          $log.info('redirect logout', redirect_to);
          if (redirect_to) {
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
    getToken: function() {
      return ipCookie('token');
    }
  });
})
.factory('authInterceptor', function ($rootScope, ipCookie, $injector) {
  return {
    // Add authorization token to headers
    request: function (config) {
      config.headers = config.headers || {};
      var t = ipCookie('token');
      if (t) {
        config.headers['X-Access-Token'] = t;
      }
      return config;
    }
  };
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
})
// just run it so it can autologin
.run(function(Auth) {})
