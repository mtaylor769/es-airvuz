(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('UserController', UserController);

  UserController.$inject = ['$http', '$stateParams'];

  function UserController($http, $stateParams) {

    function getUser() {
      return $http.get('/api/users/' + $stateParams.id).then(function(response) {
        return response.data;
      })
    }

    function init() {
      getUser()
        .then(function (user) {
          vm.user = user;
        });
    }

    function editRole() {
      vm.showRoleForm = true;
    }
    ///////////////////////
    var vm = this;
    vm.showRoleForm = false;
    vm.editRole = editRole;
    vm.adminRole = [
      'root',
      'user-root',
      'user-admin'
    ];
    vm.availableRoles = [
      'user-general',
      'user-contributor',
      'video-root',
      'video-admin',
      'comment-root',
      'report-root',
      'report-admin',
      'report-user',
      'report-video',
      'sliders-root'
    ];
    init();
  }
})();

