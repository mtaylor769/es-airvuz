(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['auth', '$state', '$mdDialog'];

  function LoginController(auth, $state, $mdDialog) {
    function login() {
      /********************************************************/
      console.group('%cvm.user :', 'color:red;font:strait');
      console.log(vm.user);
      console.groupEnd();
      /********************************************************/
      auth
        .login(vm.user)
        .then(function () {
          $mdDialog.hide();
        }, function () {
          vm.isLoading = false;
          vm.isError = true;
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

