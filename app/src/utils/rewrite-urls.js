// this will rewrite any request
// usefull to keep isolated frontend from backend versioning
angular
.module("app")
// Reescribe las url que empiezan por /api
.provider('RewriteUrlsConfig', function () {
  this.start_with = {};
  this.$get = function () {
    return this;
  };
})
.factory('RewriteInterceptor', function (RewriteUrlsConfig) {
  return {
    request: function (config) {
      var i, url;

      for (i in RewriteUrlsConfig.start_with) {
        url = RewriteUrlsConfig.start_with[i];
        if (config.url.indexOf(i) === 0) {
          config.url = url + config.url.substring(i.length);
        }

      }
      //console.info(config);
      return config;
    }
  };
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('RewriteInterceptor');
});
