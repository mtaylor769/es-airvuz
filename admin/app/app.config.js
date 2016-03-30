(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .config(config);

  config.$inject = ['$locationProvider', '$compileProvider', '$mdThemingProvider', 'jwtInterceptorProvider', '$httpProvider'];

  /* @ngInject */
  function config($locationProvider, $compileProvider, $mdThemingProvider, jwtInterceptorProvider, $httpProvider) {
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

    // add token to request
    jwtInterceptorProvider.tokenGetter = [function() {
      return localStorage.getItem('id_token');
    }];

    // Add http interceptors
    $httpProvider.interceptors.push('jwtInterceptor');

    // set up the theme for angular material
    $mdThemingProvider.theme('default')
      .primaryPalette('grey', {
        'default': '900'
      })
      .accentPalette('blue-grey')
      .warnPalette('red');
  }
})();
