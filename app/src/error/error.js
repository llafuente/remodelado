'use strict';

angular
.module('app')
.provider("ErrorConfig", function () {
  // url that return user data
  this.template = 'src/error/error.tpl.html';

  this.$get = function () {
    return this;
  };
})
// This http interceptor listens for authentication failures
.factory('ModalError', ['$injector', '$log', 'ErrorConfig', function ($injector, $log, ErrorConfig) {
  var instance = null;
  var scope = null;

  function stackable(template, errors) {
    return !template && Array.isArray(errors);
  }

  function open(i, s) {
    $log.log('ModalError -> open');
    instance = i;
    scope = s;
  }

  function push_error(errors) {
    scope.errors = (scope.errors || []);
    // unique!
    errors.forEach(function(err) {
      if (scope.errors.indexOf(err) === -1) {
        scope.errors.push(err);
      }
    });

    $log.log('ModalError -> push', scope.errors);
  }

  function close() {
    $log.log('ModalError -> close');
    instance = null;
  }

  return {
    push: function(errors, template, response) {
      if (
        // unique for complex templates
        template ||
        // first?
        !instance ||
        // is no stackable
        !Array.isArray(errors)
      ) {
        return this.open(errors, template, response);
      }

      instance.opened.then(function() {
        push_error(errors);
      });
    },
    open: function(errors, template, response) {
      var $uibModal = $injector.get('$uibModal');
      var $http = $injector.get('$http');
      var $rootScope = $injector.get('$rootScope');

      var modal = $uibModal.open({
        size: template ? 'lg': undefined,
        templateUrl: ErrorConfig.template,
        scope: $rootScope,
        backdrop: 'static',
        keyboard: false,
        controller: ['$scope', '$uibModalInstance', function ($scope, $ModalInstance) {
          $scope.template = template;
          if (stackable(template, errors)) {
            scope = $scope;
            push_error(errors);
          } else {
            $scope.errors = errors;
          }


          $scope.ok = function () {
            stackable(template, errors) && close();

            $ModalInstance.close(null);
          };
        }]
      });
      stackable(template, errors) && open(modal, $rootScope);
    }
  };
}])
.factory('ErrorFormat', function() {
  return function(response) {
    var error = {
      list: [],
      template: null
    };

    if ('string' === typeof response.data) {
      error.list = [response.data];
    } else if (Array.isArray(response.data)) {
      error.list = response.data;
    } else {
      if (Array.isArray(response.data.error)) {
        error.list = response.data.error;
      } else if (response.data.error) {
        error.list = [response.data.error];
      }
    }

    return error;
  }
})
.factory('ModalErrorInterceptor', ['$q', '$injector', '$interpolate', '$log', 'ModalError', 'ErrorFormat', function ($q, $injector, $interpolate, $log, ModalError, ErrorFormat) {
  return {
    responseError: function (response) {
      $log.log('responseError::ModalErrorInterceptor', response);

      var expired_session = false;

      // manage 4XX & 5XX
      if (response.status >= 400) {
        if (response.status == 401 && response.headers('X-Session-Expired')==1) {
          //If the 401 is for session-expired then we make logout on the angularjs app
          //This way we can prevent infinity loops
          expired_session = true;
          $injector.get('Auth').logout();
        }
        var errors = ErrorFormat(response);

        if (!expired_session) {
          ModalError.push(errors.list, errors.template, response);
        }
      }

      return $q.reject(response);
    }
  };
}])
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('ModalErrorInterceptor');
});
