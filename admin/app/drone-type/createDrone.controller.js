(function() {
  'use strict';
  
  angular
    .module('AirvuzAdmin')
    .controller('createDroneController', createDroneController);

  createDroneController.$inject = ['$http', 'dialog'];
  
  function createDroneController($http, dialog) {

    function createDrone() {
      var droneToCreate = vm.drone;
      $http.post('/api/drone-type', droneToCreate).then(function(response) {
        if(response.data.errors) {
          var error = response.data.errors[0];
          dialog.alert({
            title: 'Error',
            content: error.displayMsg,
            ok:'Ok'
          })
        } else {
          dialog.alert({
            title: 'Saved',
            content: 'Drone has been saved',
            ok:'Ok'
          })
        }
      }, function(status) {
      })
    }
    
    
    ///////
    var vm = this;
    vm.drone = {};
    vm.createDrone = createDrone;
  }
})();