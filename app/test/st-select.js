angular
.module('app')
.directive('stSelect', [function() {
  return {
    restrict: 'E',
    require: '^stTable',
    scope: {
      collection: '=',
      predicate: '@',
      predicateExpression: '='
    },
    template: '<select class="input-sm form-control" ng-model="selectedOption" ng-change="optionChanged(selectedOption)" ng-options="o._id as o.label for o in distinctItems"></select>',
    link: function(scope, element, attr, table) {
      var getPredicate = function() {
        var predicate = scope.predicate;
        if (!predicate && scope.predicateExpression) {
          predicate = scope.predicateExpression;
        }
        return predicate;
      };

      scope.$watch('collection', function(newValue) {
        var predicate = getPredicate();

        if (newValue) {
          scope.distinctItems = [{id: null, label: 'Any'}]
            .concat(_.values(scope.collection));

          scope.selectedOption = scope.distinctItems[0].id;
          scope.optionChanged(scope.selectedOption);
        }
      }, true);

      scope.optionChanged = function(selectedOption) {
        table.search(selectedOption, getPredicate());
      };
    }
  };
}]);
