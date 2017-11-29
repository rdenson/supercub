(function() {
  'use strict';

  var authService = angular.module('service.authentication', [
        'resource.auth-user',
        'ngCookies',
      ]);

  authService.factory('AuthService', [
    '$cookies',
    '$q',
    'AuthUserResource',
    function($cookies,$q, AuthUserResource) {
      var that = this;

      this.user = {
        get: function() {
          var sessionID = -1;

          if( !angular.isDefined($cookies.get('token')) || $cookies.get('token') == '' ){
            sessionID = 0;
          } else {
            sessionID = $cookies.get('token');
          }

          return sessionID;
        },
        remove: function(username, sessionID) {
          AuthUserResource.endSession(username, sessionID).then(
            //...
          );
        },
        verify: function(username, password) {
          var authenticationResultDO = $q.defer();

          AuthUserResource.startSession(username, password).then(
            function(resp) {
              $cookies.put('token', resp.token);
              authenticationResultDO.resolve({ message: '' });
            },
            function(resp) {
              authenticationResultDO.resolve({ message: resp.apiMessage });
            }
          );

          return authenticationResultDO.promise;
        },
      };

      return this;
    }
  ]);
})();
