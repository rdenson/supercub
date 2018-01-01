(function () {
  'use strict';

  var medFormModule = angular.module('controller.form-medication-list', [
        'resource.form',
        'resource.patient',
        'ngRoute'
      ]);

  medFormModule.value('medModel', {
    content: {},
    name: 'Medication List',
    preamble: {
      facilityName: '',
      patient: '',
      patientName: '',
      visitDate: ''
    },
    routeName: 'med',
    suffix: {
      pharmacistName: '',
      signatureDate: '',
      timeSpent: ''
    }
  });

  medFormModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/chart/:patientId/med', {
        controller: 'NewMedFormController',
        templateUrl: 'controller/form/medication-list.html',
        resolve: {
          patient: function($route, PatientResource) {
            return PatientResource.get($route.current.params.patientId);
          }
        }
      })
      .when('/chart/:patientId/med/:formId', {
        controller: 'MedFormController',
        templateUrl: 'controller/form/medication-list.html',
        resolve: {
          formContent: function($route, FormResource) {
            return FormResource.get('map', $route.current.params.formId);
          }
        }
      });
  }]);

  medFormModule.controller('NewMedFormController', [
    '$location',
    '$scope',
    'FormResource',
    'patient',
    'mapModel',
    function($location, $scope, FormResource, patient, medModel) {
      //seed the form; blank entries
      $scope.form = angular.extend({}, medModel);

      //navigation
      $scope.returnToChart = function() {
        var patientChart = '/patient/chart/' + patient._id;

        $location.path(patientChart);
      };
    }
  ]);

  medFormModule.controller('MapFormController', [
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
    }
  ]);
})();
