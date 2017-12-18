(function() {
  'use strict';

  var FormModule = angular.module('resource.form', [
        'factory.api-response'
      ]);

  FormModule.factory('FormResource', [
    '$http',
    '$q',
    'apiResponse',
    function($http, $q, apiResponse) {
      var RESOURCE_BASE_PATH = '/v1/form',
          FormResource = {};

      FormResource.create = function(formModel) {
        var apiResponseDO = $q.defer(),
            payload = formModel;

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

      return FormResource;
    }
  ]);
})();
