(function() {
  'use strict';

  var userModule = angular.module('resource.user', [
        'factory.api-response'
      ]);

  userModule.factory('UserResource', [
    '$http',
    '$q',
    'apiResponse',
    function($http, $q, apiResponse) {
      var RESOURCE_BASE_PATH = '/v1/user',
          UserResource = {};

      UserResource.get = function() {
        var apiResponseDO = $q.defer(),
            salt = new Date().getTime();

        $http.get(RESOURCE_BASE_PATH + '?_s=' + salt).then(
          function(resp) {
            apiResponseDO.resolve(apiResponse.parse(resp));
          },
          function(err) {
            apiResponseDO.reject(apiResponse.parse(err));
          }
        );

        return apiResponseDO.promise;
      };

      return UserResource;
    }
  ]);
})();
