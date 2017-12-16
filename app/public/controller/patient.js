(function () {
  'use strict';

  var patientModule = angular.module('controller.patient', [
        'resource.facility',
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
    '$location',
    '$scope',
    'FacilityResource',
    'FormUtilitiesResource',
    'PatientResource',
    function($location, $scope, FacilityResource, FormUtilitiesResource, PatientResource) {
      $scope.form = {
        facilityList: [{ display: 'select...', value: '' }],
        failureMessage: '',
        genderList: FormUtilitiesResource.getGenders(),
        hasFailure: false,
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
      };
      $scope.patientDisplay = 'New Patient';

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

      $scope.savePatient = function() {
        PatientResource.save($scope.patient).then(
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
