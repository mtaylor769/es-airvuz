(function () {
  'use strict';
  var isSSL = window.location.protocol === 'https:';

  if (!isSSL && window.location.hostname !== 'localhost') {
    window.location.href = 'https://' + window.location.host + window.location.pathname;
  }
  angular
    .module('AirvuzAdmin', [
      // Angular core
      'ngResource',

      // 3rd party
      'ui.router',
      'angular-jwt',
      'ngMaterial',
      'ngSanitize',
      'evaporate',
      'ngMaterialDatePicker',
      'angularMoment',
      'ngTagsInput',
      'vjs.video'
    ]);
})();
