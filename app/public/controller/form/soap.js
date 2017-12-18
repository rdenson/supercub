(function () {
  'use strict';

  var soapFormModule = angular.module('controller.form-soap', [
        'resource.form',
        'resource.patient',
        'ngRoute'
      ]);

  soapFormModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/chart/:patientId/soap', {
      controller: 'SoapFormController',
      templateUrl: 'controller/form/soap.html',
      resolve: {
        patientResource: function($route, PatientResource) {
          return PatientResource.get($route.current.params.patientId);
        }
      }
    });
  }]);

  soapFormModule.controller('SoapFormController', [
    '$location',
    '$scope',
    'FormResource',
    'patientResource',
    function($location, $scope, FormResource, patientResource) {
      $scope.form = {
        assessment: '',
        name: 'SOAP Note',
        objective: '',
        plan: '',
        preamble: {
          facilityName: getFacility(patientResource.patient),
          patient: patientResource.patient._id,
          patientName: getPatientName(patientResource.patient),
          patientSsn: patientResource.patient.identity.ssn,
          visitDate: ''
        },
        routeName: 'soap',
        subjective: '',
        suffix: {
          pharmacistName: '',
          signatureDate: '',
          timeSpent: ''
        }
      };

      $scope.returnToChart = function() {
        var patientChart = '/patient/chart/' + patientResource.patient._id;

        $location.path(patientChart);
      };

      $scope.saveForm = function() {
        FormResource.create($scope.form).then(
          function(resourceResult) {
            if( !resourceResult.isError ){
              $scope.returnToChart();
            }

          },
          function(resourceError) {
            $scope.form.hasFailure = resourceError.isError;
            $scope.form.failureMessage = resourceError.apiMessage;
          }
        );
      };

      function getFacility(patientObject) {
        if( angular.isDefined(patientObject.facility) ){
          return patientObject.facility.name;
        } else {
          return 'no associated facility';
        }
      }

      function getPatientName(patientObject) {
        var formattedName = patientObject.generalInfo.lastname + ' '
              + patientObject.generalInfo.middlename + ', '
              + patientObject.generalInfo.firstname;

        return formattedName + ' (' + patientObject.identity.mrn + ')';
      }
    }
  ]);
})();
