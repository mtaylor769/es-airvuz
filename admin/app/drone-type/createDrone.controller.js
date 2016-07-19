(function() {
  'use strict';
  
  angular
    .module('AirvuzAdmin')
    .controller('createDroneController', createDroneController);

  createDroneController.$inject = ['DroneType', '$http', 'dialog'];
  
  function createDroneController(DroneType, $http, dialog) {
    getDroneTypes();

    function getDroneTypes() {
      DroneType
        .query()
        .$promise
        .then(function(drones) {
          console.log(drones);
        vm.allDrones = drones;
      })
    }

    function createDrone() {
      var droneToCreate = vm.drone;
      $http.post('/api/drone-type', droneToCreate).then(function(response) {
        if(response.data.errors) {
          console.log('IN ERROR');
          console.log(response);
          var error = response.data.errors[0];
          dialog({
            title: 'error',
            content: error.displayMsg,
            ariaLabel: '',
            ok:'OK',
            cancel:'CANCEL'
          })
        } else {
          console.log('NORMAL');
          console.log(response);
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