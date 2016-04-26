(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .config(config);

  config.$inject = ['$locationProvider', '$compileProvider', '$mdThemingProvider', 'jwtInterceptorProvider', '$httpProvider', 'evaProvider'];

  /* @ngInject */
  function config($locationProvider, $compileProvider, $mdThemingProvider, jwtInterceptorProvider, $httpProvider, evaProvider) {

    evaProvider.config({
      signerUrl: '/api/amazon/sign-auth',
      aws_key: 'AKIAIXDMGK4H4EX4BDOQ',
      bucket: 'airvuz-tmp',
      aws_url: 'https://s3-us-west-2.amazonaws.com',
      logging: false
    });

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
