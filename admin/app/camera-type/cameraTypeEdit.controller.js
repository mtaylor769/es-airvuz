(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('cameraTypeEditController', cameraTypeEditController);

  cameraTypeEditController.$inject = ['CameraType','$state', 'dialog'];

  function cameraTypeEditController(CameraType, $state, dialog) {
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
        .$promise
        .then(function() {
          dialog({
            title: 'Saved',
            content: 'Camera Type has been updated',
            airaLabel: 'Saved',
            ok: 'OK',
            cancel: 'Cancel'
          })
        })
    }



    ////////////
    var vm = this;
    vm.saveCameraType = saveCameraType;
  }



})();