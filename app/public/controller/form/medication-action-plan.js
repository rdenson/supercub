(function () {
  'use strict';

  var mapFormModule = angular.module('controller.form-medication-action-plan', [
        'resource.form',
        'resource.patient',
        'ngRoute'
      ]);

  mapFormModule.value('mapModel', {
    content: {
      planItems: []
    },
    name: 'Medication Action Plan',
    preamble: {
      facilityName: '',
      patient: '',
      patientName: '',
      visitDate: ''
    },
    routeName: 'map',
    suffix: {
      pharmacistName: '',
      signatureDate: '',
      timeSpent: ''
    }
  });

  mapFormModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/chart/:patientId/map', {
        controller: 'NewMapFormController',
        templateUrl: 'controller/form/medication-action-plan.html',
        resolve: {
          patient: function($route, PatientResource) {
            return PatientResource.get($route.current.params.patientId);
          }
        }
      })
      .when('/chart/:patientId/map/:formId', {
        controller: 'MapFormController',
        templateUrl: 'controller/form/medication-action-plan.html',
        resolve: {
          formContent: function($route, FormResource) {
            return FormResource.get('map', $route.current.params.formId);
          }
        }
      });
  }]);

  mapFormModule.controller('NewMapFormController', [
    '$location',
    '$scope',
    'FormResource',
    'patient',
    'mapModel',
    function($location, $scope, FormResource, patient, mapModel) {
      //seed the form; blank entries
      $scope.form = angular.extend({}, mapModel);

      //fill out form fields we know
      $scope.form.preamble.facilityName = getFacility(patient);
      $scope.form.preamble.patient = patient._id;
      $scope.form.preamble.patientName = getPatientName(patient);
      //initialize a plan items to empty array (extend does not reset the array)
      $scope.form.content.planItems = [];
      $scope.canRemovePlanItems = false;

      //navigation
      $scope.returnToChart = function() {
        var patientChart = '/patient/chart/' + patient._id;

        $location.path(patientChart);
      };

      $scope.startAnotherRow = function() {
        var emptyPlanItem = {
              concern: '',
              result: '',
              steps: ''
            };

        $scope.form.content.planItems.push(angular.extend({}, emptyPlanItem));
        $scope.canRemovePlanItems = $scope.form.content.planItems.length > 1;
      };
      $scope.startAnotherRow();

      $scope.removeLastRow = function() {
        $scope.form.content.planItems.pop();
        $scope.canRemovePlanItems = $scope.form.content.planItems.length > 1;
      };

      $scope.saveForm = function() {
        var formCopy = angular.extend({}, $scope.form),
            scrubbedPlanItems = angular.copy($scope.form.content.planItems);

        //get rid of angular's key/value pair generated from the ng-repeat
        scrubbedPlanItems.forEach(function(v, k) {
          delete v['$$hashKey'];
        });
        formCopy.content.planItems = scrubbedPlanItems;

        FormResource.create(formCopy).then(
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

  mapFormModule.controller('MapFormController', [
    '$location',
    '$scope',
    'formContent',
    'FormResource',
    function($location, $scope, formContent, FormResource) {
      //populate form directly from database
      $scope.form = angular.extend({}, formContent);
      $scope.canRemovePlanItems = false;

      //navigation
      $scope.returnToChart = function() {
        var patientChart = '/patient/chart/' + formContent.preamble.patient;

        $location.path(patientChart);
      };

      $scope.saveForm = function() {
        var formCopy = angular.extend({}, $scope.form),
            scrubbedPlanItems = angular.copy($scope.form.content.planItems);

        //get rid of angular's key/value pair generated from the ng-repeat
        scrubbedPlanItems.forEach(function(v, k) {
          delete v['$$hashKey'];
        });
        formCopy.content.planItems = scrubbedPlanItems;

        FormResource.update(formCopy).then(
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

      $scope.startAnotherRow = function() {
        var emptyPlanItem = {
              concern: '',
              result: '',
              steps: ''
            };

        $scope.form.content.planItems.push(angular.extend({}, emptyPlanItem));
        $scope.canRemovePlanItems = $scope.form.content.planItems.length > 1;
      };

      $scope.removeLastRow = function() {
        $scope.form.content.planItems.pop();
        $scope.canRemovePlanItems = $scope.form.content.planItems.length > 1;
      };
    }
  ]);
})();
