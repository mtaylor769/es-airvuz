(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('droneTypeController', droneTypeController);

  droneTypeController.$inject = ['DroneType'];

  function droneTypeController(DroneType) {
    getDroneType();

    function getDroneType() {
      DroneType.query()
        .$promise
        .then(function(droneType) {
          vm.droneType = droneType;
        })
    }

    function editDroneType(droneTypeId) {
      console.log(droneTypeId);
    }

    //////////////////
    var vm = this;
    vm.editDroneType = editDroneType;
  }
})();