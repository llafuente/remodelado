'use strict';

angular
.module('<%= app_name %>')
.controller('<%= controllers.list_ctrl %>', function ($rootScope, $scope, $http, $log) {
  var last_tablestate;

  function build_qs(tablestate) {
    var pagination = tablestate.pagination;
    //pagination.start = pagination.start || 0;
    $log.debug('(*list)', JSON.stringify(tablestate));

    var qs = {
      limit: 10,
      where: {}
    };

    if (tablestate.sort && tablestate.sort.predicate) {
      qs.sort = (tablestate.sort.reverse ? '-' : '') + tablestate.sort.predicate;
    }

    qs.offset = pagination.start || 0;

    if (tablestate.search && tablestate.search.predicateObject) {
      for(var i in tablestate.search.predicateObject) {
        $log.debug(i, tablestate.search.predicateObject[i]);
        qs.where[i] = tablestate.search.predicateObject[i];
      }
    }

    return qs;
  }

  $scope.getList = function(tablestate) {
    last_tablestate = tablestate;
    var qs = build_qs(tablestate);
    var pagination = tablestate.pagination;

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

  $scope.download = function(type) {
    var qs = build_qs(last_tablestate);

    return  $http({
      method: 'GET',
      url: '<%= api.urls.list %>',
      params: qs,
      headers: {
        'Accept': type
      }
    }).then(function(res) {
      console.log(res.data);
    });
  }

  $scope.delete = function(idx, row) {
    $http({
      method: 'DELETE',
      url: '<%= api.urls.delete %>/'.replace(':<%= api.id_param %>', row._id)
    }).then(function() {
      $scope.list.list.splice(idx, 1);
      --$scope.list.count;
    });
  }
});
