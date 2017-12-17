(function () {
  'use strict';

  var patientChartModule = angular.module('controller.patient-chart', [
        'resource.patient',
        'ngRoute'
      ]);

  patientChartModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/patient/chart/:patientId', {
      controller: 'PatientChartController',
      templateUrl: 'controller/patient-chart.html',
      resolve: {
        patientResource: function($route, PatientResource) {
          return PatientResource.get($route.current.params.patientId);
        }
      }
    });
  }]);

  patientChartModule.controller('PatientChartController', [
    '$scope',
    'patientResource',
    function($scope, patientResource) {
      $scope.patient = {
        id: patientResource.patient._id,
        mrn: patientResource.patient.identity.mrn,
        name: patientResource.patient.generalInfo.lastname + ' '
          + patientResource.patient.generalInfo.middlename + ', '
          + patientResource.patient.generalInfo.firstname
      }
    }
  ]);
})();
