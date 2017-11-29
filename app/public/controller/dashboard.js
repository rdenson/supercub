(function () {
  'use strict';

  var dashboardModule = angular.module('controller.dashboard', [
        'ngRoute'
      ]);

  dashboardModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
      controller: 'DashboardController',
      templateUrl: 'controller/dashboard.html'
    });
  }]);

  dashboardModule.controller('DashboardController', [
    '$location',
    '$scope',
    function($location, $scope) {
      $scope.createPatient = function() {
        $location.path('/patient');
      };
    }
  ]);
})();
