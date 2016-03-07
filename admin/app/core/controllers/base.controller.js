(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('BaseController', BaseController);

  BaseController.$inject = ['$scope', 'identity', '$mdDialog', '$mdSidenav', 'auth'];

  function BaseController($scope, identity, $mdDialog, $mdSidenav, auth) {

    if (!identity.isAuthenticated()) {
      showLoginDialog();
    }

    function showLoginDialog() {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        templateUrl: '/admin/app/login/partial/login.html',
        controller: 'LoginController',
        controllerAs: 'loginCtrl'
      });
    }

    function showSideBar() {
      $mdSidenav('left').toggle();
    }

    function logout() {
      auth.logout();
      window.location.href = '/';
    }

    var vm = this;
    vm.logout = logout;
    vm.showSideBar = showSideBar;
  }
})();