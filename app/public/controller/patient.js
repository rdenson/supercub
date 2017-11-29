(function () {
  'use strict';

  var patientModule = angular.module('controller.patient', [
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
    function($scope) {
      $scope.page = {
        patientDisplay: 'New Patient',
        form: {
          stateList: [
            'Alabama',
            'Alaska',
            'Arizona',
            'Arkansas',
            'California',
            'Colorado',
            'Connecticut',
            'Delaware',
            'Florida',
            'Georgia',
            'Hawaii',
            'Idaho',
            'Illinois',
            'Indiana',
            'Iowa',
            'Kansas',
            'Kentucky',
            'Louisiana',
            'Maine',
            'Maryland',
            'Massachusetts',
            'Michigan',
            'Minnesota',
            'Mississippi',
            'Missouri',
            'Montana',
            'Nebraska',
            'Nevada',
            'New Hampshire',
            'New Jersey',
            'New Mexico',
            'New York',
            'North Carolina',
            'North Dakota',
            'Ohio',
            'Oklahoma',
            'Oregon',
            'Pennsylvania',
            'Rhode Island',
            'South Carolina',
            'South Dakota',
            'Tennessee',
            'Texas',
            'Utah',
            'Vermont',
            'Virginia',
            'Washington',
            'West Virginia',
            'Wisconsin',
            'Wyoming'
          ]
        }
      };
      //$scope.dateOfBirth
    }
  ]);
})();
