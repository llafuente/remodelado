// this is an option module
// will configure your app to use raw-urlencoded-body instead of json-body
angular
.module("app")
.config(function ($httpProvider) {
  // raw request no json-body
  $httpProvider.defaults.headers.get = $httpProvider.defaults.headers.get || {};
  $httpProvider.defaults.headers.patch = $httpProvider.defaults.headers.patch || {};

  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  $httpProvider.defaults.headers.patch['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  $httpProvider.defaults.headers.get['Accept'] = 'application/json';

  $httpProvider.defaults.transformRequest = function(data) {
    if (data === undefined) {
      return data;
    }
    return $.param(data);
  };
});
