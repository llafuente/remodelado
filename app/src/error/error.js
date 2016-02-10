'use strict';

// $rootScope.modal_error, contains if there is a model active
angular
.module('app')
.provider("ErrorConfig", function () {
  // url that return user data
  this.default_template = 'src/error/error.tpl.html';
  this.templates = {};

  this.$get = function () {
    return this;
  };
})
// This http interceptor listens for authentication failures
.factory('ErrorHandler', ['$injector', '$log', 'ErrorConfig', '$q', function ($injector, $log, ErrorConfig, $q) {
  var error_list = [];
  var instance;

  function pop_error(result_cb) {
    var err_data = error_list[0];
    error_list.splice(0, 1);

    //deferred
    var i;
    for (i = 0; i < err_data.deferred.length; ++i) {
      console.log("reject?", err_data.deferred[i]);
      if (err_data.deferred[i]) {
      console.log(err_data.deferred[i].reject);
        err_data.deferred[i].reject(err_data.response[i]);
      }
    }
  }

  // check if the error can be squashed
  function squash_errors() {
    if (error_list[0].type) {
      return;
    }

    // squask all un-type related errors
    var i;
    var err_data = error_list[0];
    for (i = 1; i < error_list.length; ++i) {
      if (!error_list[i].error.type) {
        console.log("error_list[i].list", error_list[i].error.list);
        err_data.error.list = err_data.error.list.concat(error_list[i].error.list);
        err_data.response.push(error_list[i].response[0]);
        err_data.deferred.push(error_list[i].deferred[0]);
        error_list.splice(i, 1);
        --i;
      }
    }
  }

  function show_modal() {
    if (!error_list.length) {
      return;
    }

    if (instance) {
      squash_errors();

      return instance.closed.then(function() {
        show_modal();
      });
    }

    var $uibModal = $injector.get('$uibModal');
    var $http = $injector.get('$http');
    var $rootScope = $injector.get('$rootScope');


    var err_data = error_list[0];
    var err = err_data.error;
    var templateUrl = ErrorConfig.default_template;
    if (err.type) {
      templateUrl = ErrorConfig.templates[err.type];
    }


    instance = $uibModal.open({
      size: err.type ? 'lg': undefined,
      templateUrl: templateUrl,
      scope: $rootScope,
      backdrop: 'static',
      keyboard: false,
      controller: ['$scope', '$uibModalInstance', function ($scope, $ModalInstance) {
        $scope.templateUrl = templateUrl;
        $scope.error = err;

        $scope.retry = function () {
          //pop_error($q.reject);
        };

        $scope.close = function () {
          pop_error();

          instance = null;
          $ModalInstance.close(null);
        };

        $scope.ok = function () {
          pop_error();

          instance = null;
          $ModalInstance.close(null);
        };
      }]
    });
  }

  return {
    push: function(error, response) {
      var serr = {
        error: error,
        deferred: [null],
        response: [response],
        modal: null
      };

      // defer if has a type
      // because can be retried
      if (error.type) {
        serr.deferred[0] = $q.defer();
      }

      error_list.push(serr);

      show_modal();

      return serr.deferred[0] ? serr.deferred[0].promise : $q.reject(response);
    }
  };
}])
.factory('ErrorFormat', function() {
  return function(response) {
    var error = {
      list: [],
      type: null
    };

    console.log("filter", response.data);

    if ('string' === typeof response.data) {
      error.list = [response.data];
    } else if (Array.isArray(response.data)) {
      error.list = response.data.slice(0);
    } else {
      if (Array.isArray(response.data.error)) {
        error.list = response.data.error.slice(0);
      } else if (response.data.error) {
        error.list = [response.data.error];
      }
      if (response.data.type) {
        error.type = response.data.type;
      }
    }

    return error;
  };
})
.factory('ErrorInterceptor', ['$q', '$injector', '$interpolate', '$log', 'ErrorHandler', 'ErrorFormat', function ($q, $injector, $interpolate, $log, ErrorHandler, ErrorFormat) {
  return {
    responseError: function (response) {
      $log.log('responseError::ErrorInterceptor', response);

      var expired_session = false;

      // manage 4XX & 5XX
      if (response.status >= 400) {
        if (response.status == 401 && response.headers('X-Session-Expired') == 1) {
          //If the 401 is for session-expired then we make logout on the angularjs app
          //This way we can prevent infinity loops
          expired_session = true;
          $injector.get('Auth').logout();
        }

        var errors = ErrorFormat(response);

        // TODO handle retry
        // TODO modal should be promisable?
        if (!expired_session) {
          return ErrorHandler.push(errors, response);
        }
      }

      return $q.reject(response);
    }
  };
}])
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('ErrorInterceptor');
});
