(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('StaffPickVideoController', StaffPickVideoController);

  StaffPickVideoController.$inject = ['$http'];

  function StaffPickVideoController($http) {

    function initialize() {
      $http.get('/api/staff-pick-videos')
        .then(function (response) {
          vm.videoCollection = response.data;
        });
    }

    function addVideo(id) {
      vm.videoCollection.videos.push(id);
      _updateVideoCollection();
    }

    function _updateVideoCollection() {
      $http.put('/api/staff-pick-videos', {videos: vm.videoCollection.videos})
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