(function () {
  'use strict';

  var patientModule = angular.module('controller.patient', [
        'resource.facility',
        'resource.form-utilities',
        'resource.patient',
        'ngRoute'
      ]);

  patientModule.value('patientModel', {
    demographics: {
      drugAllergies: [],
      gender: 'select...',
      heightFeet: 0,
      heightInches: 0,
      language: 'English',
      lastHospitalized: '',
      physicianName: '',
      physicianPhone: '',
      physicianFax: '',
      race: '',
      weightLbs: 0
    },
    facility: '',
    generalInfo: {
      address: '',
      city: '',
      firstname: '',
      lastname: '',
      middlename: '',
      state: 'Texas',
      zipcode: ''
    },
    identity: {
      dateOfBirth: '',
      mrn: '',
      ssn: ''
    },
    notes: ''
  });

  patientModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/patient', {
      controller: 'NewPatientController',
      templateUrl: 'controller/patient.html'
    })
    .when('/patient/:patientId', {
      controller: 'PatientController',
      templateUrl: 'controller/patient.html',
      resolve: {
        patient: function($route, PatientResource) {
          return PatientResource.get($route.current.params.patientId);
        }
      }
    });
  }]);

  patientModule.controller('NewPatientController', [
    '$location',
    '$scope',
    'FacilityResource',
    'FormUtilitiesResource',
    'patientModel',
    'PatientResource',
    function($location, $scope, FacilityResource, FormUtilitiesResource, patientModel, PatientResource) {
      $scope.form = {
        facilityList: [{ display: 'select...', value: '' }],
        failureMessage: '',
        genderList: FormUtilitiesResource.getGenders(),
        hasFailure: false,
        languageList: FormUtilitiesResource.getLanguages(),
        stateList: FormUtilitiesResource.getStates()
      };
      $scope.newDrugAllergy = '';
      //seed the form
      $scope.patient = angular.extend({}, patientModel);
      $scope.allowAddEditInsurance = false;

      FacilityResource.list().then(function(resourceResult) {
        resourceResult.listing.forEach(function(facility) {
          $scope.form.facilityList.push({
            display: facility.name,
            value: facility._id
          });
        });
      });

      //add a new allergy to a list of the patient's drug allergies
      $scope.addDrugAllergy = function() {
        //sanitize
        var newAllergy = $scope.newDrugAllergy.trim();

        //add the allergy if there's one to add
        if( !!newAllergy.length ){
          $scope.patient.demographics.drugAllergies.push($scope.newDrugAllergy);
        }

        //reset the form
        $scope.newDrugAllergy = '';
      };

      $scope.returnToDashboard = function() {
        $location.path('/');
      }

      $scope.savePatient = function() {
        PatientResource.create($scope.patient).then(
          function(resourceResult) {
            if( !resourceResult.isError ){
              //$location.path('/');
              //ask user about insurance...
              //  branch:
              //    yes - goto to patient insurance route
              //    no - goto to dashboard route
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

  patientModule.controller('PatientController', [
    '$location',
    '$scope',
    'FacilityResource',
    'FormUtilitiesResource',
    'patient',
    'PatientResource',
    function($location, $scope, FacilityResource, FormUtilitiesResource, patient, PatientResource) {
      $scope.form = {
        facilityList: [{ display: 'select...', value: '' }],
        failureMessage: '',
        genderList: FormUtilitiesResource.getGenders(),
        hasFailure: false,
        languageList: FormUtilitiesResource.getLanguages(),
        stateList: FormUtilitiesResource.getStates()
      };
      $scope.newDrugAllergy = '';
      //populate form directly from database
      $scope.patient = angular.extend({}, patient);
      $scope.allowAddEditInsurance = true;

      //a little massage for the facility ui
      if( angular.isDefined(patient.facility) ){
        $scope.patient.facility = patient.facility._id;
      }

      FacilityResource.list().then(function(resourceResult) {
        resourceResult.listing.forEach(function(facility) {
          $scope.form.facilityList.push({
            display: facility.name,
            value: facility._id
          });
        });
      });

      //add a new allergy to a list of the patient's drug allergies
      $scope.addDrugAllergy = function() {
        //sanitize
        var newAllergy = $scope.newDrugAllergy.trim();

        //add the allergy if there's one to add
        if( !!newAllergy.length ){
          $scope.patient.demographics.drugAllergies.push($scope.newDrugAllergy);
        }

        //reset the form
        $scope.newDrugAllergy = '';
      };

      $scope.inspectInsurance = function() {
        $location.path('/patient/' + patient._id + '/insurance');
      };

      $scope.returnToDashboard = function() {
        $location.path('/');
      }

      $scope.savePatient = function() {
        PatientResource.update($scope.patient).then(
          function(resourceResult) {
            if( !resourceResult.isError ){
              $location.path('/');
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
