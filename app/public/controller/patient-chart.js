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

      $scope.returnToDashboard = function() {
        $location.path('/');
      };

      function getAssociatedForms() {
        FormResource.listForms().then(function(resourceResult) {
          var temporaryFiller = [
                {
                  _id: 101,
                  lastModified: '12/02/2017',
                  name: 'Medication Action Plan',
                  preamble: {
                    patient: 75,
                    visitDate: '11/29/2017'
                  },
                  routeName: 'map'
                },
                {
                  _id: 102,
                  lastModified: '12/02/2017',
                  name: 'Medication List',
                  preamble: {
                    patient: 76,
                    visitDate: '11/30/2017'
                  },
                  routeName: 'meds'
                }
              ];

          //dates from mongo come back in UTC...
          resourceResult.listing.forEach(function(form) {
            var parsedDate = new Date(form.dates.modified.replace('T', ' ').replace('Z', '') + ' UTC');

            //let's use local time and for this usage output only the date portion
            form.lastModified = (parsedDate.getMonth() + 1) + '/' + parsedDate.getDate() + '/' + parsedDate.getFullYear()
          });

          //concatenating the temporaryFiller should go away soon
          $scope.formCollection = temporaryFiller.concat(resourceResult.listing);
        });
      }
    }
  ]);
})();
