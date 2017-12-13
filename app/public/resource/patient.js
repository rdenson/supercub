(function() {
  'use strict';

  var PatientModule = angular.module('resource.patient', [
        'factory.api-response'
      ]);

  PatientModule.factory('PatientResource', [
    '$http',
    '$q',
    'apiResponse',
    function($http, $q, apiResponse) {
      var RESOURCE_BASE_PATH = '/v1/patient',
          PatientResource = {};

      PatientResource.delete = function(patientId) {
        var apiResponseDO = $q.defer();

        $http.delete(RESOURCE_BASE_PATH + '/' + patientId).then(
          function(resp) {
            apiResponseDO.resolve(apiResponse.parse(resp));
          },
          function(err) {
            apiResponseDO.reject(apiResponse.parse(err));
          }
        );

        return apiResponseDO.promise;
      };

      PatientResource.get = function(patientId) {
        var apiResponseDO = $q.defer();

        $http.get(RESOURCE_BASE_PATH + '/' + patientId).then(
          function(resp) {
            apiResponseDO.resolve(apiResponse.parse(resp));
          },
          function(err) {
            apiResponseDO.reject(apiResponse.parse(err));
          }
        );

        return apiResponseDO.promise;
      };

      PatientResource.list = function() {
        var apiResponseDO = $q.defer();

        $http.get(RESOURCE_BASE_PATH + '/report/recentlyModified').then(
          function(resp) {
            apiResponseDO.resolve(apiResponse.parse(resp));
          },
          function(err) {
            apiResponseDO.reject(apiResponse.parse(err));
          }
        );

        return apiResponseDO.promise;
      };

      PatientResource.save = function(patientModel) {
        var apiResponseDO = $q.defer(),
            payload = patientModel;

        $http.post(RESOURCE_BASE_PATH, payload).then(
          function(resp) {
            apiResponseDO.resolve(apiResponse.parse(resp));
          },
          function(err) {
            apiResponseDO.reject(apiResponse.parse(err));
          }
        );

        return apiResponseDO.promise;
      };

      return PatientResource;
    }
  ]);
})();
