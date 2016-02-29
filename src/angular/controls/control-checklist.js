/*<% if (control.sourceHttp) { %>*/
  $scope["<%= control.name %>_options"] = [];
  $http(<%= JSON.stringify(control.sourceHttp) %>)
  .then(function(response) {
    $scope["<%= control.name %>_options"] = response.data;
  });
/*<% } else { %>*/
  $scope["<%= control.name %>_options"] = $injector.get("<%= control.label_values%>")();
/*<% } %>*/
