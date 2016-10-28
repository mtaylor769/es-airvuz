(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('seoSearchController', seoSearchController);

  seoSearchController.$inject = ['$http'];

  function seoSearchController($http) {

    function executeSearch() {
      vm.keywordResult = false;
      vm.noResults = false;
      vm.waiting = true;
      $http.get('/api/video/search-keywords', {params: {keyword: vm.searchKeyword}})
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
    vm.executeSearch = executeSearch;
    vm.goToVideo = goToVideo;
  }
})();