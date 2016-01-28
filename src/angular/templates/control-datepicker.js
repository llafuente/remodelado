$scope.datepickers = $scope.datepickers || {};
$scope.datepickers['<%= id%>_opended'] = false;

$scope['<%= id%>_close'] = function ($event) {
  console.log("close", $scope.datepickers);
    $scope.datepickers['<%= id%>_opended'] = false;
};

$scope['<%= id%>_open'] = function ($event) {
  console.log("open", $scope.datepickers);
    //only prevent if sent
    if ($event) {
        $event.preventDefault();
        $event.stopPropagation();
    }

    // close all datepickers, except this one
    var i;
    for (i in $scope.datepickers) {
      $scope.datepickers[i] = false;
    }

    $scope.datepickers['<%= id%>_opended'] = true;

    // jQuery enabled ?
    // $("#<%= id%>").focus();
};
