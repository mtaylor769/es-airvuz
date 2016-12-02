(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('autoViewsCreateController', autoViewsCreateController);

  autoViewsCreateController.$inject = ['$http', 'dialog'];

  function autoViewsCreateController($http, dialog) {

    function saveAutoView() {
      console.log(vm.view);
      $http.post('/api/auto-views', vm.view).then(function(response) {
        vm.view = {};
        vm.view.origin = 'admin';
      }, function(error) {
        dialog.serverError();
      });
    }

  /////////////////////////
    var vm = this;
    vm.view = {};
    vm.view.origin = 'admin';
    vm.probs = ['0.2', '0.3', '0.4', '0.5', '0.6', '0.7'];

    vm.saveAutoView = saveAutoView;
  }


})();