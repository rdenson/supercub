(function () {
  'use strict';

  var soapDocumentModule = angular.module('controller.documents-soap', [
        'resource.patient',
        'ngRoute'
      ]);

  soapDocumentModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/chart/:patientId/soap', {
      controller: 'SoapDocController',
      templateUrl: 'controller/documents/soap.html',
      resolve: {
        patientResource: function($route, PatientResource) {
          return PatientResource.get($route.current.params.patientId);
        }
      }
    });
  }]);

  soapDocumentModule.controller('SoapDocController', [
    '$location',
    '$scope',
    'patientResource',
    function($location, $scope, patientResource) {
      $scope.document = {
        assessment: '',
        objective: '',
        plan: '',
        preamble: {
          patient: patientResource.patient._id,
          visitDate: ''
        },
        subjective: '',
        suffix: {
          pharmacistName: '',
          signatureDate: '',
          timeSpent: ''
        }
      };
      $scope.patient = {
        id: patientResource.patient._id,
        facility: getFacility(patientResource.patient),
        name: patientResource.patient.generalInfo.lastname + ' '
          + patientResource.patient.generalInfo.middlename + ', '
          + patientResource.patient.generalInfo.firstname,
        mrn: patientResource.patient.identity.mrn,
        ssn: patientResource.patient.identity.ssn
      }

      $scope.returnToChart = function() {
        $location.path('/patient/chart/' + $scope.patient.id);
      };

      $scope.saveDocument = function() {
        console.log($scope.document);
      };

      function getFacility(patientObject) {
        if( angular.isDefined(patientObject.facility) ){
          return patientObject.facility.name;
        } else {
          return 'no associated facility';
        }
      }
    }
  ]);
})();
