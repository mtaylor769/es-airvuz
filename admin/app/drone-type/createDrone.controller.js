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
            content: 'Drone has been saved',
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
    vm.drone = {};
    vm.createDrone = createDrone;
  }
})();