(function () {
  'use strict';

  var patientChartModule = angular.module('controller.patient-chart', [
        'resource.form',
        'resource.patient',
        'ngRoute'
      ]);

  patientChartModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/patient/chart/:patientId', {
      controller: 'PatientChartController',
      templateUrl: 'controller/patient-chart.html',
      resolve: {
        patient: function($route, PatientResource) {
          return PatientResource.get($route.current.params.patientId);
        }
      }
    });
  }]);

  patientChartModule.controller('PatientChartController', [
    '$location',
    '$scope',
    'FormResource',
    'patient',
    function($location, $scope, FormResource, patient) {
      $scope.formCollection = [];
      $scope.patient = {
        id: patient._id,
        mrn: patient.identity.mrn,
        name: patient.generalInfo.lastname + ' '
          + patient.generalInfo.middlename + ', '
          + patient.generalInfo.firstname
      }

      getAssociatedForms();

      $scope.editPatient = function() {
        $location.path('/patient/' + patient._id);
      };

      $scope.returnToDashboard = function() {
        $location.path('/');
      };

      //probably should move this logic to the form resource
      function getAssociatedForms() {
        FormResource.listForms(patient._id).then(function(resourceResult) {
          //dates from mongo come back in UTC...
          resourceResult.listing.forEach(function(form) {
            var parsedDate = new Date(form.dates.modified.replace('T', ' ').replace('Z', '') + ' UTC');

            //let's use local time and for this usage output only the date portion
            form.lastModified = (parsedDate.getMonth() + 1) + '/' + parsedDate.getDate() + '/' + parsedDate.getFullYear()
          });

          $scope.formCollection = resourceResult.listing;
        });
      }
    }
  ]);
})();
