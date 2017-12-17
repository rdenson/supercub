(function() {
  'use strict';

  var consoApp = angular.module('ConSo', [
        'controller.auth',
        'controller.dashboard',
        'controller.documents-soap',
        'controller.facility',
        'controller.patient',
        'controller.patient-chart',
        'resource.auth-user',
        'resource.user',
        'ngCookies'
      ]);

  consoApp.config([
    '$httpProvider',
    '$httpParamSerializerProvider',
    '$routeProvider',
    function($httpProvider, $httpParamSerializerProvider, $routeProvider){
      var serializeParam = $httpParamSerializerProvider.$get();

      $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
      $httpProvider.defaults.transformRequest = [
        function(data) {
          return angular.isObject(data) && String(data) !== '[object File]' ? serializeParam(data) : data;
        }
      ];

      $httpProvider.interceptors.push([
        '$q',
        '$rootScope',
        function($q, $rootScope) {
          function success(response) {
            return response;
          }

          function error(response) {
            return $q.reject(response);
          }

          return function (promise) {
            return promise.then(success, error);
          };
          /*return {
            request: function(config) {
              var sessionID = $cookies.get('token');

              if( $location.path() != '/auth' && (angular.isDefined(sessionID) && sessionID.length > 0) ){
                config.headers.common['token'] = sessionID;
              } else{
                $location.path('/auth');
              }

              return config;
            },
            requestError: function(err) { return $q.reject(err); },
            response: function(resp) { return resp; },
            responseError: function(err) { return $q.reject(err); }
          };*/
        }
      ]);
    }
  ]);

  consoApp.controller('MainController', [
    '$cookies',
    '$http',
    '$location',
    '$rootScope',
    '$route',
    '$scope',
    'AuthUserResource',
    'UserResource',
    function($cookies, $http, $location, $rootScope, $route, $scope, AuthUserResource, UserResource) {
      $scope.appVersion = '';
      //this controller's user object
      $scope.user = {
        verified: false,
        session: {}
      };
      //global access for user metadata
      $rootScope.user = $scope.user.session;

      $scope.goHome = function() {
        $location.path('/');
      }

      //terminate a session
      $scope.logout = function() {
        AuthUserResource.endSession($scope.user.session.userid).then(
          function(resp) {
            delete $http.defaults.headers.common.token;
            $scope.user.session = {};
            $scope.user.verified = false;
            $location.path('/auth');
          },
          function(err) { console.log(err); }
        );
      };

      //only fetch the application version "once" (if unavailable)
      if( !$scope.appVersion.length ){
        //ugly but, quick call to server api
        $http.get('/version', ).then(
          function(resp) { $scope.appVersion = resp.data.sha.slice(0, 7); },
          function() { $scope.appVersion = 'unknown'; }
        );
      }

      $rootScope.$on('$routeChangeStart', function(next, current) {
        var sessionID = $cookies.get('token');

        //handle page classes; /auth is public, everyone else needs credentials
        if( $location.path() != '/auth' && angular.isDefined(sessionID) && sessionID.length > 0 ){
          $http.defaults.headers.common['token'] = sessionID;
          UserResource.get().then(
            function(resp) {
              if( resp.session == null ){
                $scope.logout();
              } else {
                angular.extend($scope.user.session, JSON.parse(resp.session));
                $scope.user.verified = true;
              }
            },
            function(err) { console.log(err); }
          );
        } else {
          //redirect to public page
          $location.path('/auth');
        }
      });
      $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
        //...
      });
      $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
        console.log( arguments );
      });
    }
  ]);
})();
