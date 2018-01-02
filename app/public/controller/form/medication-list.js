(function () {
  'use strict';

  var medFormModule = angular.module('controller.form-medication-list', [
        'resource.form',
        'resource.patient',
        'ngRoute'
      ]);

  medFormModule.value('medModel', {
    content: {
      medications: []
    },
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
            return FormResource.get('med', $route.current.params.formId);
          }
        }
      });
  }]);

  medFormModule.controller('NewMedFormController', [
    '$location',
    '$scope',
    'FormResource',
    'patient',
    'medModel',
    function($location, $scope, FormResource, patient, medModel) {
      //seed the form; blank entries
      $scope.form = angular.extend({}, medModel);

      //fill out form fields we know
      $scope.form.preamble.facilityName = getFacility(patient);
      $scope.form.preamble.patient = patient._id;
      $scope.form.preamble.patientName = getPatientName(patient);
      //initialize a plan items to empty array (extend does not reset the array)
      $scope.form.content.medications = [];
      $scope.canRemoveMedications = false;

      //navigation
      $scope.returnToChart = function() {
        var patientChart = '/patient/chart/' + patient._id;

        $location.path(patientChart);
      };

      $scope.startAnotherRow = function() {
        var emptyMedicationRow = {
              usage: '',
              name: '',
              form: '',
              dosage: '',
              directions: '',
              startdate: '',
              enddate: '',
              notes: ''
            };

        $scope.form.content.medications.push(angular.extend({}, emptyMedicationRow));
        $scope.canRemoveMedications = $scope.form.content.medications.length > 1;
      };
      $scope.startAnotherRow();

      $scope.removeLastRow = function() {
        $scope.form.content.medications.pop();
        $scope.canRemoveMedications = $scope.form.content.medications.length > 1;
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

  medFormModule.controller('MedFormController', [
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

      $scope.startAnotherRow = function() {
        var emptyMedicationRow = {
              usage: '',
              name: '',
              form: '',
              dosage: '',
              directions: '',
              startdate: '',
              enddate: '',
              notes: ''
            };

        $scope.form.content.medications.push(angular.extend({}, emptyMedicationRow));
        $scope.canRemoveMedications = $scope.form.content.medications.length > 1;
      };

      $scope.removeLastRow = function() {
        $scope.form.content.medications.pop();
        $scope.canRemoveMedications = $scope.form.content.medications.length > 1;
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
