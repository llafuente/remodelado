angular
.module('app')
.directive('stDateRange', ['$timeout', function($timeout) {
  return {
    restrict: 'E',
      require: '^stTable',
      scope: {
        before: '=',
          after: '='
        },
      templateUrl: 'test/st-date-range.tpl.html',

      link: function($scope, element, attr, table) {
        $scope.filter = {};
        var predicateName = attr.predicate;

        $scope.$watch("filter", function(a, b) {
          if (a.before || a.after) {
            var f = {};

            if (a.before) {
              f.$gt = a.before;
            }

            if (a.after) {
              f.$lt = a.after;
            }

            table.search(f, predicateName);
          } else {
            table.search(null, predicateName);
          }
        }, true);

        /*
        [inputBefore, inputAfter].forEach(function(input) {

          input.bind('blur', function() {
            var query = {};

            if (!scope.isBeforeOpen && !scope.isAfterOpen) {
              if (scope.before) {
                query.before = scope.before;
              }

              if (scope.after) {
                query.after = scope.after;
              }

              scope.$apply(function() {
                table.search(query, predicateName);
              });
            }
          });
        });
        */
      }
    };
}]);
