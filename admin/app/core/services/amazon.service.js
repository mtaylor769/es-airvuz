(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .factory('Amazon', Amazon);

  Amazon.$inject = [];

  function Amazon() {
    var inputBucket, outputBucket, assetBucket, inputUrl, outputUrl, assetUrl;

    switch(window.location.host) {
      case 'airvuz.com':
      case 'www.airvuz.com':
        inputBucket = 'airvuz-drone-video-input';
        outputBucket = 'airvuz-drone-video';
        assetBucket = 'airvuz-asset';
        inputUrl = '//s3-us-west-2.amazonaws.com/' + inputBucket + '/';
        outputUrl = '//s3-us-west-2.amazonaws.com/' + outputBucket + '/';
        assetUrl =  '//s3-us-west-2.amazonaws.com/' + assetBucket + '/';

        break;
      default:
        inputBucket = 'airvuz-videos-beta-input';
        outputBucket = 'airvuz-videos-beta';
        assetBucket = 'airvuz-asset-beta';
        inputUrl = '//s3-us-west-2.amazonaws.com/' + inputBucket + '/';
        outputUrl = '//s3-us-west-2.amazonaws.com/' + outputBucket + '/';
        assetUrl =  '//s3-us-west-2.amazonaws.com/' + assetBucket + '/';
    }

    return {
      inputBucket:  inputBucket,
      inputUrl: inputUrl,
      outputBucket: outputBucket,
      outputUrl: outputUrl,
      assetBucket:  assetBucket,
      assetUrl: assetUrl,
      ACCESS_KEY: 'AKIAIXDMGK4H4EX4BDOQ'
    };
  }
})();