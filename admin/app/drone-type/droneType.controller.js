(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('droneTypeController', droneTypeController);

  droneTypeController.$inject = ['DroneType'];

  function droneTypeController(DroneType) {
    getDroneType();

    function getDroneType() {
      DroneType.query({flag: 'all'})
        .$promise
        .then(function(droneType) {
          vm.droneType = droneType;
        })
    }
    
    function createDrone() {
      window.location.href = '/admin/droneType/create';
    }

    function editDroneType(droneTypeId) {
      window.location.href = '/admin/droneType/' + droneTypeId;
    }

    //////////////////
    var vm = this;
    vm.editDroneType = editDroneType;
    vm.createDrone = createDrone;
  }
})();