// based on https://github.com/blackat/ui-navbar
// added permissions
angular
.module("app")
.provider("NavbarLeft", function () {
  this.tree = [];

  this.$get = function () {
    return this;
  };
  this.push = function (order, data) {
    data.order = order;
    this.tree.push(data);
  };
  this.sort = function() {
    this.tree.sort(function(a, b) {
      return b.index - a.index;
    });
  };
})
.directive('navbarTree', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      navbarTree: '='
    },
    templateUrl: 'template/navbar-ul-tree.html'
  };
})
.directive('navbarSubTree', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      navbarSubTree: '='
    },
    templateUrl: 'template/navbar-ul-subtree.html'
  };
})
.directive('navbarLeaf', function ($compile) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      navbarLeaf: '='
    },
    templateUrl: 'template/navbar-li.html',
    link: function (scope, element, attrs) {
      if (angular.isArray(scope.navbarLeaf.subtree)) {
        element.append('<navbar-tree navbar-tree=\"navbarLeaf.subtree\"></navbar-tree>');
        var parent = element.parent();
        var classFound = false;
        while(parent.length > 0 && !classFound) {
          if(parent.hasClass('navbar-right')) {
          classFound = true;
          }
          parent = parent.parent();
        }

        if(classFound) {
          element.addClass('dropdown-submenu-right');
        } else {
         element.addClass('dropdown-submenu');
        }

        $compile(element.contents())(scope);
      }
    }
  };
})
.run(["$templateCache", function($templateCache) {
  // TODO mouseover -> click if possible
  $templateCache.put("template/navbar-ul-tree.html",
  '<ul class="nav navbar-nav">\n'+
  '  <li ui-sref-active="active" uib-dropdown="" is-open="tree.isopen" ng-repeat="tree in navbarTree" ng-init="tree.isopen = false">\n'+
  '    <a uib-dropdown-toggle="" ng-mouseover="tree.isopen = true" ui-sref=\"{{tree.state}}\">\n'+
  '      <span translate>{{tree.name}}</span>\n'+
  '      <b class="caret" class="ng-hide" ng-show="tree.subtree"></b>\n'+
  '    </a>\n'+
  '    <navbar-sub-tree navbar-sub-tree="tree.subtree" class="ng-hide" ng-show="tree.subtree"></navbar-sub-tree>\n'+
  '  </li>\n'+
  '</ul>');


  $templateCache.put("template/navbar-ul-subtree.html",
  "<ul class='dropdown-menu'>\n" +
  "  <navbar-leaf ng-repeat='leaf in navbarSubTree' navbar-leaf='leaf'></leaf>\n" +
  "</ul>");

  $templateCache.put("template/navbar-li.html",
  "<li ng-class=\"{divider: navbarLeaf.name == 'divider'}\">\n" +
  "  <a ui-sref=\"{{navbarLeaf.state}}\" ng-if=\"navbarLeaf.name !== 'divider'\">{{navbarLeaf.name}}</a>\n" +
  "</li>");

}]);
