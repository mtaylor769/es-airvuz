(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .factory('Amazon', Amazon);

  Amazon.$inject = [];

  function Amazon() {
    var inputBucket, outputBucket, assetBucket;

    switch(window.location.host) {
      case 'airvuz.com':
      case 'www.airvuz.com':
        inputBucket = 'airvuz-drone-video-input';
        outputBucket = 'airvuz-drone-video';
        assetBucket = 'airvuz-asset';

        break;
      default:
        inputBucket = 'airvuz-videos-beta-input';
        outputBucket = 'airvuz-videos-beta';
        assetBucket = 'airvuz-asset-beta';
    }

    return {
      inputBucket: inputBucket,
      outputBucket: outputBucket,
      assetBucket: assetBucket
    };
  }
})();