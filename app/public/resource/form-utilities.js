(function() {
  'use strict';

  var formUtilitiesModule = angular.module('resource.form-utilities', [
        //...
      ]);

  formUtilitiesModule.factory('FormUtilitiesResource', [
    function() {
      var FormUtilitiesResource = {},
          choicePlaceholder = 'select...';

      FormUtilitiesResource.getFacilityTypes = function() {
        return [
          choicePlaceholder,
          'Community Center',
          'Long-Term Care',
          'Skilled Nursing'
        ]
      };

      FormUtilitiesResource.getGenders = function() {
        return [
          choicePlaceholder,
          'Male',
          'Female',
          'Other'
        ];
      };

      FormUtilitiesResource.getLanguages = function() {
        return [
          'Afrikaans',
          'Cantonese',
          'Chinese',
          'English',
          'French',
          'German',
          'Hebrew',
          'Hindi',
          'Japanese',
          'Korean',
          'Mandarin',
          'Pashto',
          'Persian',
          'Portuguese',
          'Romanian',
          'Russian',
          'Spanish',
          'Tagalog',
          'Ukrainian',
          'Urdu',
          'Vietnamese',
          'Xhosa',
          'Yiddish'
        ];
      };

      FormUtilitiesResource.getStates = function() {
        return [
          'Alabama',
          'Alaska',
          'Arizona',
          'Arkansas',
          'California',
          'Colorado',
          'Connecticut',
          'Delaware',
          'Florida',
          'Georgia',
          'Hawaii',
          'Idaho',
          'Illinois',
          'Indiana',
          'Iowa',
          'Kansas',
          'Kentucky',
          'Louisiana',
          'Maine',
          'Maryland',
          'Massachusetts',
          'Michigan',
          'Minnesota',
          'Mississippi',
          'Missouri',
          'Montana',
          'Nebraska',
          'Nevada',
          'New Hampshire',
          'New Jersey',
          'New Mexico',
          'New York',
          'North Carolina',
          'North Dakota',
          'Ohio',
          'Oklahoma',
          'Oregon',
          'Pennsylvania',
          'Rhode Island',
          'South Carolina',
          'South Dakota',
          'Tennessee',
          'Texas',
          'Utah',
          'Vermont',
          'Virginia',
          'Washington',
          'West Virginia',
          'Wisconsin',
          'Wyoming'
        ];
      };

      return FormUtilitiesResource;
    }
  ]);
})();
