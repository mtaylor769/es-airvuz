(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('curationLandingController', curationLandingController);

  curationLandingController.$inject = ['$state'];

  function curationLandingController($state) {

    function curationRedirectType(params) {
      $state.go('videoCuration.rating', {type: params});
    }

    function curationRedirectVideoId() {
      $state.go('videoCuration.rating', {videoId: vm.videoId});
    }

    function searchSeoKeywords() {
      $state.go('videoCuration.searchSeo', {keyword: vm.seoKeyword});
    }

    ////////////////
    var vm = this;
    vm.curationRedirectType = curationRedirectType;
    vm.curationRedirectVideoId = curationRedirectVideoId;
    vm.searchSeoKeywords = searchSeoKeywords;
  }
})();