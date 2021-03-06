'use strict';

angular
.module('<%= app_name %>')
.config(function ($stateProvider, $urlRouterProvider, $locationProvider, navbarLeftProvider) {
  var $log =  angular.injector(['ng']).get('$log')
  $log.debug('(Routes) <%= base_state %>');

  <% if (navbar) { %>
  navbarLeftProvider.push(1, {
    name: "<%= navbar.label %>",
    permissions: ["<%= api.permissions.list %>", "<%= navbar.permissions || null %>"],
    roles: "<%= navbar.roles || null %>",
    state: "<%= states.root %>",
  });
  <% } %>

  $urlRouterProvider
  .when('/<%= base_state %>', '/<%= base_state %>/list');

  $stateProvider
  .state('<%= states.root %>', {
    url: '/<%= base_state %>',
    template: '<ui-view></ui-view>',
    // TODO parameter?
    authenticate: true,
    resolve: {},
    data: {
      model: 'entity'
    }
  })
  .state('<%= states.list %>', {
    url: '/list',
    templateUrl: '<%= templates.list %>',
    controller: '<%= controllers.list_ctrl %>',
    resolve: {},
    data: {
      model: 'list'
    },
  })
  .state('<%= states.create %>', {
    url: '/create',
    templateUrl: '<%= templates.create %>',
    controller: '<%= controllers.create_ctrl %>',
    resolve: {},
  })
  .state('<%= states.update %>', {
    url: '/update/:<%= api.id_param %>',
    templateUrl: '<%= templates.update %>',
    controller: '<%= controllers.update_ctrl %>',
    resolve: {
      entity: ['$http', '$state', '$stateParams', function($http, $state, $stateParams) {
        return $http({
          method: 'GET',
          url: '<%= api.urls.read %>/'.replace(':<%= api.id_param %>', $stateParams['<%= api.id_param %>'])
        }).then(function(res) {
          return res.data;
        });
      }],
    },
    data: {
      model: 'entity'
    }
  });
})
<% _.each(schema, function(control, idx) {
  if (control.labels) {
%>
.constant('<%= control.label_values %>', function() {
  return <%= JSON.stringify(control.labels) %>;
})
.run(function($rootScope, <%= control.label_values %>) {
  $rootScope['<%= control.label_values %>'] = <%= control.label_values %>();
})
<%
}
if (control.source_url) {
%>
.factory('<%= control.label_values %>', function($http, $rootScope) {
  var values;
  $http(<%= JSON.stringify(control.source_url) %>)
  .then(function(response) {
    values = response.data.list;
    $rootScope['<%= control.label_values %>'] = response.data.list;
  });
  return function() {
    return values;
  }
})
<%
}
if (control.labels || control.source_url) {
%>
.filter('<%= control.label_filter %>', ['<%= control.label_values %>', function(values_fn) {
  return function(id) {
    var values = values_fn();
    if (!values) return ''; // w8 a bit more...

    function get(k) {
      var v = _.find(values, {_id: k});
      return v ? v.label : '??';
    }


    if (Array.isArray(id)) {
      return id.map(get).join(", ");
    }

    return get(id);
  }
}])
<%
  }
});
%>

;
