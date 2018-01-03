(function() {
  'use strict';

  var InsuranceModule = angular.module('resource.insurance', [
        'factory.api-response'
      ]);

  InsuranceModule.factory('InsuranceResource', [
    '$http',
    '$q',
    'apiResponse',
    function($http, $q, apiResponse) {
      var RESOURCE_BASE_PATH = '/v1/insurance',
          InsuranceResource = {};

      InsuranceResource.create = function(insuranceModel) {
        var apiResponseDO = $q.defer(),
            payload = insuranceModel;

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

      InsuranceResource.get = function(insuranceId) {
        var apiResponseDO = $q.defer();

        $http.get(RESOURCE_BASE_PATH + '/' + insuranceId).then(
          function(resp) {
            apiResponseDO.resolve(apiResponse.parse(resp));
          },
          function(err) {
            apiResponseDO.reject(apiResponse.parse(err));
          }
        );

        return apiResponseDO.promise;
      };

      InsuranceResource.list = function(patientId) {
        var apiResponseDO = $q.defer();

        $http.get(RESOURCE_BASE_PATH + '/list/' + patientId).then(
          function(resp) {
            var parsedResponse = apiResponse.parse(resp);

            if( parsedResponse.listing.length ){
              parsedResponse.listing.forEach(function(insurance) {
                var parsedDate = new Date(insurance.dates.modified.replace('T', ' ').replace('Z', '') + ' UTC');

                //let's use local time and for this usage output only the date portion
                insurance.lastModified = (parsedDate.getMonth() + 1) + '/' + parsedDate.getDate() + '/' + parsedDate.getFullYear()
              });
            }

            apiResponseDO.resolve(parsedResponse);
          },
          function(err) {
            apiResponseDO.reject(apiResponse.parse(err));
          }
        );

        return apiResponseDO.promise;
      };

      InsuranceResource.update = function(insuranceModel) {
        var apiResponseDO = $q.defer(),
            payload = insuranceModel;

        $http.put(RESOURCE_BASE_PATH, payload).then(
          function(resp) {
            apiResponseDO.resolve(apiResponse.parse(resp));
          },
          function(err) {
            apiResponseDO.reject(apiResponse.parse(err));
          }
        );

        return apiResponseDO.promise;
      };

      return InsuranceResource;
    }
  ]);
})();
