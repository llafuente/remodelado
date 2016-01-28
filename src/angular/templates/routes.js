"use strict";

angular
.module('<%= app_name %>')
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
  console.info("<%= base_state %> routes setup");

  $urlRouterProvider
  .when('/<%= base_state %>', '/<%= base_state %>/list');

  $stateProvider
  .state('<%= base_state %>', {
    url: '/<%= base_state %>',
    templateUrl: 'views/<%= base_state %>.tpl.html',
    data: {
      model: "entity"
    }
  })
  .state('<%= base_state %>.list', {
    url: '/list',
    templateUrl: 'views/<%= base_state %>.list.tpl.html',
    controller: '<%= base_state %>ListCtrl',
    resolve: {
      list: ["$http", function($http) {
        return  $http({
          method: "GET",
          url: "<%= list_url %>"
        });
      }],
    },
    data: {
      model: "list"
    }
  })
  .state('<%= base_state %>.create', {
    url: '/create',
    templateUrl: 'views/<%= base_state %>.create.tpl.html',
    controller: '<%= base_state %>CreateCtrl',
    // TODO defaults
    resolve: {
    }
  })
  .state('<%= base_state %>.update', {
    url: '/update/:<%= param_url %>',
    templateUrl: 'views/<%= base_state %>.update.tpl.html',
    controller: '<%= base_state %>UpdateCtrl',
    resolve: {
      entity: ['$http', '$state', '$stateParams', function($http, $state, $stateParams) {
        return $http.get('<%= read_url %>/'.replace('<%= param_url %>', $stateParams['<%= param_url %>']));
      }],
    },
    data: {
      model: "entity"
    }
  });
});
