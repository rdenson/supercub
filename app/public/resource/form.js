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

      FormResource.get = function(formAbbr, formId) {
        var apiResponseDO = $q.defer();

        $http.get(RESOURCE_BASE_PATH + '/' + formAbbr + '/' + formId).then(
          function(resp) {
            var parsedResponse = apiResponse.parse(resp);

            apiResponseDO.resolve(parsedResponse.form);
          },
          function(err) {
            apiResponseDO.reject(apiResponse.parse(err));
          }
        );

        return apiResponseDO.promise;
      };

      FormResource.listForms = function(patientId) {
        var apiResponseDO = $q.defer();

        $http.get(RESOURCE_BASE_PATH + '/list?patientId=' + patientId).then(
          function(resp) {
            apiResponseDO.resolve(apiResponse.parse(resp));
          },
          function(err) {
            apiResponseDO.reject(apiResponse.parse(err));
          }
        );

        return apiResponseDO.promise;
      };

      FormResource.update = function(formModel) {
        var apiResponseDO = $q.defer(),
            payload = formModel;

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

      return FormResource;
    }
  ]);
})();
