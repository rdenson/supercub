(function () {
  'use strict';

  var authModule = angular.module('controller.auth', [
        'resource.auth-user',
        'ngCookies',
        'ngRoute'
      ]);

  authModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/auth', {
      controller: 'AuthorizationController',
      templateUrl: 'controller/auth.html'
    });
  }]);

  authModule.value('DefaultForm', {
    failureMessage: '',
    hasFailure: false,
    pass: '',
    user: ''
  });

  authModule.controller('AuthorizationController', [
    '$cookies',
    '$location',
    '$rootScope',
    '$scope',
    'AuthUserResource',
    'DefaultForm',
    function($cookies, $location, $rootScope, $scope, AuthUserResource, DefaultForm) {
      $scope.form = angular.extend({}, DefaultForm);

      $scope.login = function() {
        AuthUserResource.startSession($scope.form.user, $scope.form.pass).then(
          function(resp) {
            //default front page
            $location.path('/');
          },
          function(resp) {
            $scope.form.hasFailure = resp.isError;
            $scope.form.failureMessage = resp.apiMessage;
          }
        );
      };
    }
  ]);
})();
