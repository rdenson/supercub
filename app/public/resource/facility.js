(function() {
  'use strict';

  var FacilityModule = angular.module('resource.facility', [
        'factory.api-response'
      ]);

  FacilityModule.factory('FacilityResource', [
    '$http',
    '$q',
    'apiResponse',
    function($http, $q, apiResponse) {
      var RESOURCE_BASE_PATH = '/v1/facility',
          FacilityResource = {};

      FacilityResource.create = function(facilityModel) {
        var apiResponseDO = $q.defer(),
            payload = facilityModel;

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

      return FacilityResource;
    }
  ]);
})();
