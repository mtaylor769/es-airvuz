(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .config(config);

  config.$inject = ['$locationProvider', '$compileProvider', '$mdThemingProvider'];

  /* @ngInject */
  function config($locationProvider, $compileProvider, $mdThemingProvider) {
    // use html5 pushState if available
    if (window.history && history.pushState) {
      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });
      $locationProvider.hashPrefix('!');
    }

    // disable scope info for performance
    $compileProvider.debugInfoEnabled(false);

    // set up the theme for angular material
    $mdThemingProvider.theme('default')
      .primaryPalette('grey', {
        'default': '900'
      })
      .accentPalette('blue-grey')
      .warnPalette('red');
  }
})();
