(function() {
  'use strict'

  angular
    .module('AirvuzAdmin')
    .controller('droneTypeEditController', droneTypeEditController);

  droneTypeEditController.$inject = ['DroneType','$state'];

  function droneTypeEditController(DroneType, $state) {
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
    }



    ////////////
    var vm = this;
    vm.saveDroneType = saveDroneType;
  }



})();