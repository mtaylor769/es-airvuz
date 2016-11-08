(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('StaffPickVideoController', StaffPickVideoController);

  StaffPickVideoController.$inject = ['$http', 'Amazon'];

  function StaffPickVideoController($http, Amazon) {

    function initialize() {
      $http.get('/api/staff-pick-videos')
        .then(function (response) {
          vm.videoCollection = response.data;
        });
    }

    function addVideo(id) {
      vm.videoCollection.unshift(id);
      _updateVideoCollection();
    }

    function _updateVideoCollection() {
      $http.put('/api/staff-pick-videos', {videos: vm.videoCollection})
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