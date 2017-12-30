(function () {
  'use strict';

  var facilityModule = angular.module('controller.facility', [
        'resource.facility',
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
    '$location',
    '$scope',
    'FacilityResource',
    'FormUtilitiesResource',
    function($location, $scope, FacilityResource, FormUtilitiesResource) {
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
        failureMessage: '',
        hasFailure: false,
        stateList: FormUtilitiesResource.getStates()
      };

      $scope.returnToDashboard = function() {
        $location.path('/');
      }

      $scope.createFacility = function() {
        FacilityResource.create($scope.facility).then(
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
