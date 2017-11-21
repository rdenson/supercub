(function () {
  'use strict';

  var authModule = angular.module('controller.auth', [
        'ngRoute'
      ]);

  authModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/auth', {
      controller: 'AuthorizationController',
      templateUrl: 'controller/auth.html'
    });
  }]);

  authModule.controller('AuthorizationController', [
    '$scope',
    function($scope) {
      //...
    }
  ]);
})();
