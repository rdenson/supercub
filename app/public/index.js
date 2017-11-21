(function() {
  'use strict';

  var consoApp = angular.module('ConSo', [
        'controller.auth',
        'ngRoute'
      ]);

  consoApp.config([
    '$httpProvider',
    '$routeProvider',
    function($httpProvider, $routeProvider){
      $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
      $httpProvider.defaults.transformRequest = [
        function(data) {
          return angular.isObject(data) && String(data) !== '[object File]' ? $.param(data) : data;
        }
      ];

      $httpProvider.interceptors.push([
        '$rootScope',
        '$q',
        '$parse',
        function($rootScope, $q, $parse) {
          function success(response) {
            return response;
          }

          function error(response) {
            if(response.status == 401 || response.status == 404){
              $rootScope.$broadcast('event:401-404');
            }

            // otherwise
            return $q.reject(response);
          }

          return function (promise) {
            return promise.then(success, error);
          };
        }
      ]);
    }
  ]);

  consoApp.controller('MainController', [
    '$http',
    '$location',
    '$rootScope',
    '$route',
    '$scope',
    function($http, $location, $rootScope, $route, $scope) {
      $rootScope.$on('$routeChangeStart', function(next, current) {
        //...
      });
      $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
        //...
      });
      $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
        console.log( arguments );
      });
      $rootScope.$on('event:401-404',function() {
        console.log( 'route not found!' );
        console.log( arguments );
      });
    }
  ]);
})();
