(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('featuredVideoController', featuredVideoController);

  featuredVideoController.$inject = ['$http', 'Amazon'];

  function featuredVideoController($http, Amazon) {

    function initialize() {
      $http.get('/api/featured-videos')
        .then(function (response) {
          vm.videoCollection = response.data;
        });
    }

    function addVideo(id) {
      vm.videoCollection.unshift(id);
      _updateVideoCollection();
    }

    function _updateVideoCollection() {
      $http.put('/api/featured-videos', {videos: vm.videoCollection})
        .then(function () {
          initialize();
        })
    }

    function removeVideo(index) {
      vm.videoCollection.splice(index, 1);
      _updateVideoCollection();
    }

    ///////////////////////
    var vm          = this;
    vm.addVideo     = addVideo;
    vm.removeVideo  = removeVideo;
    vm.amazonOutputUrl    = Amazon.outputUrl;

    initialize();
  }
})();