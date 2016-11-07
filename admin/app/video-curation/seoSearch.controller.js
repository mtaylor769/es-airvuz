(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('seoSearchController', seoSearchController);

  seoSearchController.$inject = ['$http', '$state'];

  function seoSearchController($http, $state) {

    function executeSearch() {
      vm.keywordResult = false;
      vm.noResults = false;
      vm.waiting = true;
      $http.get('/api/video/search-keywords', {params: {keyword: vm.seoKeyword}})
        .then(function(response) {
          if(response.data.length) {
            vm.searchResults = response.data;
            vm.waiting = false;
            vm.keywordResult = true;
          } else {
            vm.waiting = false;
            vm.noResults = true;
          }
      });
    }

    function goToVideo(videoId) {
      window.location = '/video/' + videoId;
    }

  /////////////////////
    var vm = this;
    vm.host = window.location.host;
    vm.seoKeyword = $state.params.keyword;
    vm.goToVideo = goToVideo;
    vm.executeSearch = executeSearch;

    executeSearch();
  }
})();