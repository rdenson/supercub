(function () {
  'use strict';

  var facilityModule = angular.module('controller.facility', [
        'resource.form-utilities',
        'ngRoute'
      ]);

  facilityModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/facility', {
      controller: 'FacilityController',
      templateUrl: 'controller/facility.html'
    });
  }]);

  facilityModule.controller('FacilityController', [
    '$scope',
    'FormUtilitiesResource',
    function($scope, FormUtilitiesResource) {
      $scope.facility = {
        address: '',
        city: '',
        contact: {
          fax: '',
          person: {
            extension: '',
            name: '',
            phone: ''
          },
          phone: ''
        },
        name: '',
        notes: '',
        state: 'Texas',
        type: 'select...',
        zipcode: ''
      };
      $scope.facilityDisplay = 'New Facility';
      $scope.form = {
        facilityTypeList: FormUtilitiesResource.getFacilityTypes(),
        stateList: FormUtilitiesResource.getStates()
      };
    }
  ]);
})();
