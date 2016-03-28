(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['auth', '$state', '$mdDialog'];

  function LoginController(auth, $state, $mdDialog) {
    function login() {
      auth
        .login(vm.user)
        .then(function () {
          $mdDialog.hide();
        }, function (response) {
          vm.isError = true;
          vm.errorMessage = response.error;
        });

    }

    var vm = this;
    this.login = login;

    vm.user = {};
    vm.isLoading = false;
    vm.isError = false;
    vm.login = login;
  }
})();

