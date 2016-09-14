(function() {
  'use strict'

  angular
    .module('AirvuzAdmin')
    .controller('droneTypeEditController', droneTypeEditController);

  droneTypeEditController.$inject = ['DroneType','$state', 'dialog'];

  function droneTypeEditController(DroneType, $state, dialog) {
    getDroneType();

    function getDroneType() {
      DroneType
        .get({id: $state.params.id})
        .$promise
        .then(function(drone) {
          vm.droneType = drone;
        })
    }

    function saveDroneType() {
      var drone = vm.droneType;
      console.log(drone);
      DroneType
        .update(drone)
        .$promise
        .then(function() {
          dialog.alert({
            title: 'Saved',
            content: 'Drone Type has been updated',
            ok: 'OK'
          })
        })
    }



    ////////////
    var vm = this;
    vm.saveDroneType = saveDroneType;
  }



})();