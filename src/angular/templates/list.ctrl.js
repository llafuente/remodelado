'use strict';

angular
.module('<%= app_name %>')
.controller('<%= controllers.list_ctrl %>', function ($rootScope, $scope, $http, $log) {
  $scope.getList = function(tablestate) {
    var pagination = tablestate.pagination;

    var qs = {
      limit: 20,
      where: {}
    };
    if (tablestate.sort && tablestate.sort.predicate) {
      qs.sort = (tablestate.sort.reverse ? '-' : '') + tablestate.sort.predicate;
    }
    pagination.start = pagination.start || 0;
    qs.offset = pagination.start;

    $log.debug('(*list)', JSON.stringify(tablestate));
    if (tablestate.search && tablestate.search.predicateObject) {
      for(var i in tablestate.search.predicateObject) {
        $log.debug(i, tablestate.search.predicateObject[i]);
        qs.where[i] = tablestate.search.predicateObject[i];
      }
    }


    return  $http({
      method: 'GET',
      url: '<%= api.urls.list %>',
      params: qs
    }).then(function(res) {
      $scope.list = res.data;
      pagination.totalItemCount = res.data.count;

      pagination.start = res.data.offset;
      pagination.number = res.data.limit;

      pagination.numberOfPages = res.data.count / res.data.limit;
    });
  };

  $scope.delete = function(idx, row) {
    $http({
      method: 'DELETE',
      url: '<%= api.urls.delete %>/'.replace(':<%= api.id_param %>', row.id)
    }).then(function() {
      $scope.list.list.splice(idx, 1);
      --$scope.list.count;
    });
  }
});
