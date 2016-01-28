angular.module(<%= JSON.stringify(app) %>)
.controller(<%= JSON.stringify(ctrl) %>, function($scope) {
  console.log("start", <%= JSON.stringify(ctrl) %>);

  $scope.controls = <%= JSON.stringify(controls, null, 2) %>;
  $scope.entity = {};

  <%= extra.join("\n") %>
});
