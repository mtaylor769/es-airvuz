(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('cameraTypeEditController', cameraTypeEditController);

  cameraTypeEditController.$inject = ['CameraType','$state'];

  function cameraTypeEditController(CameraType, $state) {
    getCameraType();

    function getCameraType() {
      CameraType
        .get({id: $state.params.id})
        .$promise
        .then(function(camera) {
          vm.cameraType = camera;
        })
    }

    function saveCameraType() {
      var camera = vm.cameraType;
      console.log(camera);
      CameraType
        .update(camera)
    }



    ////////////
    var vm = this;
    vm.saveCameraType = saveCameraType;
  }



})();