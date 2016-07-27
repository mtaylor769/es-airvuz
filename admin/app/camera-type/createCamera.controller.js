(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('createCameraController', createCameraController);

  createCameraController.$inject = ['$http', 'dialog'];

  function createCameraController($http, dialog) {

    function createCamera() {
      var cameraToCreate = vm.camera;
      $http.post('/api/camera-type', cameraToCreate).then(function(response) {
        if(response.data.errors) {
          var error = response.data.errors[0];
          dialog({
            title: 'error',
            content: error.displayMsg,
            ariaLabel: 'error',
            ok:'OK',
            cancel:'CANCEL'
          })
        } else {
          dialog({
            title: 'Saved',
            content: 'Camera has been saved',
            ariaLabel: 'saved',
            ok:'OK',
            cancel:'CANCEL'
          })
        }
      }, function(status) {

      })
    }


    ///////
    var vm = this;
    vm.camera = {};
    vm.createCamera = createCamera;
  }
})();