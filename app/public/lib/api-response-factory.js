(function() {
  'use strict';

  var apiResponseFactory = angular.module('factory.api-response', [
        //...
      ]);

  apiResponseFactory.value('defaultResponse', {
    apiMessage: '',
    httpCode: 0,
    httpStatus: '',
    isError: false
  });

  apiResponseFactory.factory('apiResponse', [
    'defaultResponse',
    function(defaultResponse) {
      this.parse = function(httpResponse) {
        var newResp = angular.extend({}, defaultResponse);

        newResp.apiMessage = httpResponse.data.message;
        delete httpResponse.data.message;
        newResp.httpCode = httpResponse.status;
        newResp.httpStatus = httpResponse.statusText;
        newResp.isError = httpResponse.status >= 500;

        angular.extend(newResp, httpResponse.data);

        return newResp;
      };

      return this;
    }
  ])
})();
