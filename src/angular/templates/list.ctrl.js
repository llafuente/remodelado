"use strict";

angular
.module('<%= app_name %>')
.controller('<%= controllers.list_ctrl %>', function ($rootScope, $scope, $http) {
  $scope.getList = function(tablestate) {
    var pagination = tablestate.pagination;
    console.log(tablestate);

    var qs = ['limit=20'];
    if (tablestate.sort && tablestate.sort.predicate) {
      qs.push("sort=" + (tablestate.sort.reverse ? '-' : '') + tablestate.sort.predicate);
    }
    pagination.start = pagination.start || 0;
    qs.push('offset=' + pagination.start);

    if (tablestate.search && tablestate.search.predicateObject) {
      for(var i in tablestate.search.predicateObject) {
        qs.push('where['+i+']=' + tablestate.search.predicateObject[i]);

      }
    }


    return  $http({
      method: 'GET',
      url: '<%= api.list %>?' + qs.join('&')
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
      url: '<%= api.delete %>/'.replace(':<%= id_param %>', row.id)
    }).then(function() {
      $scope.list.list.splice(idx, 1);
      --$scope.list.count;
    });
  }
});
