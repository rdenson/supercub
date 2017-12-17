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
    '$scope',
    'patientResource',
    function($scope, patientResource) {
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
        facility: patientResource.patient.facility.name,
        name: patientResource.patient.generalInfo.lastname + ' '
          + patientResource.patient.generalInfo.middlename + ', '
          + patientResource.patient.generalInfo.firstname,
        mrn: patientResource.patient.identity.mrn,
        ssn: patientResource.patient.identity.ssn
      }

      $scope.saveDocument = function() {
        console.log($scope.document);
      };
    }
  ]);
})();
