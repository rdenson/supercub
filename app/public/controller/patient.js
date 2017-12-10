(function () {
  'use strict';

  var patientModule = angular.module('controller.patient', [
        'resource.form-utilities',
        'resource.patient',
        'ngRoute'
      ]);

  patientModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/patient', {
      controller: 'PatientController',
      templateUrl: 'controller/patient.html'
    });
  }]);

  patientModule.controller('PatientController', [
    '$scope',
    'FormUtilitiesResource',
    'PatientResource',
    function($scope, FormUtilitiesResource, PatientResource) {
      $scope.form = {
        genderList: FormUtilitiesResource.getGenders(),
        languageList: FormUtilitiesResource.getLanguages(),
        stateList: FormUtilitiesResource.getStates()
      };
      $scope.newDrugAllergy = '';
      $scope.patient = {
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
      };
      $scope.patientDisplay = 'New Patient';

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

      $scope.savePatient = function() {
        PatientResource.save($scope.patient).then(
          function() { console.log('success'); console.log(arguments[0]); },
          function() { console.log('failure!'); console.log(arguments[0]); },
        );
      };
    }
  ]);
})();
