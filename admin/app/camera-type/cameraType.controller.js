(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('cameraTypeController', cameraTypeController);

  cameraTypeController.$inject = ['CameraType'];

  function cameraTypeController(CameraType) {
    getCameraType();

    function getCameraType() {
      CameraType.query({flag: 'all'})
        .$promise
        .then(function(cameraType) {
          vm.cameraType = cameraType;
        })
    }
    
    function createCameraType() {
      window.location.href = '/admin/cameraType/create';
    }

    function editCameraType(cameraTypeId) {
      window.location.href = '/admin/cameraType/' + cameraTypeId;
    }

    //////////////////
    var vm = this;
    vm.editCameraType = editCameraType;
    vm.createCameraType = createCameraType;
  }
})();