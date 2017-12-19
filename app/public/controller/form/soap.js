(function () {
  'use strict';

  var soapFormModule = angular.module('controller.form-soap', [
        'resource.form',
        'resource.patient',
        'ngRoute'
      ]);

  soapFormModule.value('contentObject', {
    assessment: '',
    name: 'SOAP Note',
    objective: '',
    plan: '',
    preamble: {
      facilityName: '',
      patient: '',
      patientName: '',
      patientSsn: '',
      visitDate: ''
    },
    routeName: 'soap',
    subjective: '',
    suffix: {
      pharmacistName: '',
      signatureDate: '',
      timeSpent: ''
    }
  });

  soapFormModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/chart/:patientId/soap', {
        controller: 'NewSoapFormController',
        templateUrl: 'controller/form/soap.html',
        resolve: {
          patient: function($route, PatientResource) {
            return PatientResource.get($route.current.params.patientId);
          }
        }
      })
      .when('/chart/:patientId/soap/:formId', {
        controller: 'SoapFormController',
        templateUrl: 'controller/form/soap.html',
        resolve: {
          formContent: function($route, FormResource) {
            return FormResource.get($route.current.params.formId);
          }
        }
      });
  }]);

  soapFormModule.controller('NewSoapFormController', [
    '$location',
    '$scope',
    'contentObject',
    'FormResource',
    'patient',
    function($location, $scope, contentObject, FormResource, patient) {
      //seed the form; blank entries
      $scope.form = angular.extend({}, contentObject);

      //fill out form fields we know
      $scope.form.preamble.facilityName = getFacility(patient);
      $scope.form.preamble.patient = patient._id;
      $scope.form.preamble.patientName = getPatientName(patient);
      $scope.form.preamble.facilityName = patient.identity.ssn;

      //navigation
      $scope.returnToChart = function() {
        var patientChart = '/patient/chart/' + patient._id;

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

  soapFormModule.controller('SoapFormController', [
    '$location',
    '$scope',
    'formContent',
    'FormResource',
    function($location, $scope, formContent, FormResource) {
      //populate form directly from database
      $scope.form = angular.extend({}, formContent);

      //navigation
      $scope.returnToChart = function() {
        var patientChart = '/patient/chart/' + formContent.preamble.patient;

        $location.path(patientChart);
      };

      $scope.saveForm = function() {
        FormResource.update($scope.form).then(
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
    }
  ]);
})();
