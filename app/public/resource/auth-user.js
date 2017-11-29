(function() {
  'use strict';

  var authUserModule = angular.module('resource.auth-user', [
        'factory.api-response',
        'ngCookies'
      ]);

  authUserModule.factory('AuthUserResource', [
    '$cookies',
    '$http',
    '$q',
    'apiResponse',
    function($cookies, $http, $q, apiResponse) {
      var RESOURCE_BASE_PATH = '/v1/auth/user',
          AuthUserResource = {};

      //application user LOGIN
      AuthUserResource.startSession = function(user, pass) {
        var apiResponseDO = $q.defer(),
            payload = {
              knowncred: pass
            };

        //POST /v1/auth/user/<user_id>
        //gets back a unique session token
        $http.post(RESOURCE_BASE_PATH + '/' + user, payload).then(
          function(resp) {
            var parsedResponse = apiResponse.parse(resp);

            //browser cookies for local storage
            $cookies.put('token', parsedResponse.token);
            apiResponseDO.resolve(parsedResponse);
          },
          function(err) {
            apiResponseDO.reject(apiResponse.parse(err));
          }
        );

        return apiResponseDO.promise;
      };

      //application user LOGOUT
      AuthUserResource.endSession = function(user) {
        var apiResponseDO = $q.defer();

        //POST /v1/auth/user/<user_id>/destroy
        //nothing really returned here; 200
        $http.post(RESOURCE_BASE_PATH + '/' + user + '/destroy').then(
          function(resp) {
            var parsedResponse = apiResponse.parse(resp);

            //erase token on successful logout
            $cookies.remove('token');
            apiResponseDO.resolve(parsedResponse);
          },
          function(err) {
            apiResponseDO.resolve(apiResponse.parse(err));
          }
        );

        return apiResponseDO.promise;
      };

      return AuthUserResource;
    }
  ]);
})();
