(function () {
  'use strict';

  var dashboardModule = angular.module('controller.dashboard', [
        'resource.facility',
        'resource.patient',
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
    'FacilityResource',
    'PatientResource',
    function($location, $scope, FacilityResource, PatientResource) {
      $scope.facilities = [
        /*{
          address: '2000 Lyons Ave, Houston, TX 77020',
          id: 43892,
          name: 'Caring Hearts',
          type: 'Skilled Nursing'
        },
        {
          address: '501 Crawford St, Houston, TX 77002',
          id: 43893,
          name: 'Downtown',
          type: 'Long-Term Care'
        },
        {
          address: '6010 Richmond Ave, Houston, TX 77057',
          id: 43894,
          name: 'Southern Shores',
          type: 'Skilled Nursing'
        },*/
      ];
      $scope.patients = [
        /*{
          displayName: 'Columbia, Jennifer',
          facility: 'Downtown',
          id:291,
          mrn: '3425WE88B2A'
        },
        {
          displayName: 'Pham, Nhóc',
          facility: 'Southern Shores',
          id:292,
          mrn: '439G001B'
        },
        {
          displayName: 'Hussain, Mamnoon',
          facility: 'Caring Hearts',
          id:293,
          mrn: '11-00002381K'
        },*/
      ];

      FacilityResource.list().then(function(resourceResult) {
        $scope.facilities = resourceResult.listing;
      });

      function loadRecentPatients() {
        PatientResource.list().then(function(resourceResult) {
          $scope.patients = resourceResult.listing;
        });
      }

      loadRecentPatients();

      $scope.createFacility = function() {
        $location.path('/facility');
      };

      $scope.createPatient = function() {
        $location.path('/patient');
      };

      $scope.deletePatient = function(patientId) {
        PatientResource.delete(patientId).then(function() {
          loadRecentPatients();
        });
      };

      $scope.editPatient = function(patientId) {
        $location.path('/patient/' + patientId);
      };

      $scope.viewChart = function(patientId) {
        $location.path('/patient/chart/' + patientId);
        //console.log('viewChart() called ' + new Date().getTime());
      };
    }
  ]);
})();
