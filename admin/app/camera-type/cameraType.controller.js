(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('cameraTypeController', cameraTypeController);

  cameraTypeController.$inject = ['CameraType'];

  function cameraTypeController(CameraType) {
    getCameraType();

    function getCameraType() {
      CameraType.query()
        .$promise
        .then(function(cameraType) {
          vm.cameraType = cameraType;
        })
    }

    function editCameraType(cameraTypeId) {
      window.location.href = '/admin/cameraType/' + cameraTypeId;
    }

    //////////////////
    var vm = this;
    vm.editCameraType = editCameraType;
  }
})();