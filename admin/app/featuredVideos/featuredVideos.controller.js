(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('featuredVideoController', featuredVideoController);

  featuredVideoController.$inject = ['$http'];

  function featuredVideoController($http) {

    function initialize() {
      $http.get('/api/featured-videos')
        .then(function (response) {
          vm.videoCollection = response.data;
        });
    }

    function addVideo(id) {
      vm.videoCollection.videos.push(id);
      _updateVideoCollection();
    }

    function _updateVideoCollection() {
      $http.put('/api/featured-videos', {videos: vm.videoCollection.videos})
        .then(function (response) {
        })
    }

    function removeVideo(index) {
      vm.videoCollection.videos.splice(index, 1);
      _updateVideoCollection();
    }

    ///////////////////////
    var vm          = this;
    vm.addVideo     = addVideo;
    vm.removeVideo  = removeVideo;

    initialize();
  }
})();