(function () {
  'use strict';

  var patientInsuranceModule = angular.module('controller.patient-insurance', [
        'resource.insurance',
        'ngRoute'
      ]);

  patientInsuranceModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/patient/:patientId/insurance', {
      controller: 'PatientInsuranceController',
      templateUrl: 'controller/patient-insurance.html',
      resolve: {
        insurance: function($route, InsuranceResource) {
          return InsuranceResource.list($route.current.params.patientId);
        },
        patientId: function($route) {
          return $route.current.params.patientId;
        }
      }
    })
  }]);

  patientInsuranceModule.controller('PatientInsuranceController', [
    '$location',
    '$route',
    '$scope',
    '$uibModal',
    'insurance',
    'InsuranceResource',
    'patientId',
    function($location, $route, $scope, $uibModal, insurance, InsuranceResource, patientId) {
      $scope.insuranceCollection = angular.copy(insurance.listing);

      $scope.summonInsuranceForm = function(insuranceId) {
        var newEntry = !angular.isDefined(insuranceId);
        var insuranceFormInstance = $uibModal.open({
          animation: true,
          resolve: {
            form: function() {
              var emptyForm = {
                coverageDate: '',
                effectiveDate: '',
                groupNumber: '',
                insuranceId: '',
                insuranceName: '',
                isPrimary: false,
                notes: '',
                patient: patientId,
                policyHolder: ''
              };

              if( newEntry ){
                $scope.form = emptyForm;
              } else {
                InsuranceResource.get(insuranceId).then(function(resourceResult) {
                  $scope.form = resourceResult.insurance;
                });
              }
            }
          },
          scope: $scope,
          size: 'lg',
          templateUrl: 'insuranceForm.html'
        });

        $scope.isNewEntry = newEntry;

        $scope.saveInsurance = function() {
          if( newEntry ){
            InsuranceResource.create($scope.form).then(
              function(resourceResult) {
                InsuranceResource.list(patientId).then(function(resourceResponse) {
                  $scope.insuranceCollection = angular.copy(resourceResponse.listing);
                  insuranceFormInstance.close();
                });
              },
              function(resourceError) {
                console.log(resourceError);
              }
            );
          } else {
            InsuranceResource.update($scope.form).then(
              function(resourceResult) {
                InsuranceResource.list(patientId).then(function(resourceResponse) {
                  $scope.insuranceCollection = angular.copy(resourceResponse.listing);
                  insuranceFormInstance.close();
                });
              },
              function(resourceError) {
                console.log(resourceError);
              }
            );
          }
        };

        $scope.closeModal = function() {
          insuranceFormInstance.close();
        };

        //quell the "Possibly unhandled rejection" message for handing close
        //events such as ESC key press
        insuranceFormInstance.result.then(angular.noop, angular.noop);
      };

      //navigation
      $scope.returnToPatient = function() {
        $location.path('/patient/' + patientId);
      };
    }
  ]);
})();
