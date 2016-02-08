'use strict';

angular
.module('<%= app_name %>')
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
  console.info('<%= base_state %> routes setup');

  $urlRouterProvider
  .when('/<%= base_state %>', '/<%= base_state %>/list');

  $stateProvider
  .state('<%= states.root %>', {
    url: '/<%= base_state %>',
    //templateUrl: 'views/<%= base_state %>.tpl.html',
    template: '<ui-view></ui-view>',
    data: {
      model: 'entity'
    }
  })
  .state('<%= states.list %>', {
    url: '/list',
    templateUrl: '<%= templates.list %>',
    controller: '<%= controllers.list_ctrl %>',
    resolve: {
    },
    data: {
      model: 'list'
    }
  })
  .state('<%= states.create %>', {
    url: '/create',
    templateUrl: '<%= templates.create %>',
    controller: '<%= controllers.create_ctrl %>'
  })
  .state('<%= states.update %>', {
    url: '/update/:<%= id_param %>',
    templateUrl: '<%= templates.update %>',
    controller: '<%= controllers.update_ctrl %>',
    resolve: {
      entity: ['$http', '$state', '$stateParams', function($http, $state, $stateParams) {
        return $http({
          method: 'GET',
          url: '<%= api.read %>/'.replace(':<%= id_param %>', $stateParams['<%= id_param %>'])
        }).then(function(res) {
          return res.data;
        });
      }],
    },
    data: {
      model: 'entity'
    }
  });
});
