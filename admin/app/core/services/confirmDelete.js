(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .factory('confirmDelete', confirmDelete);

  confirmDelete.$inject = ['$mdDialog'];

  function confirmDelete($mdDialog) {
    return function() {
      var confirm = $mdDialog.confirm()
        .title('Please Confirm')
        .content('Are you sure you want to delete?')
        .ariaLabel('Delete confirmation')
        .ok('Yes')
        .cancel('No');
      return $mdDialog.show(confirm);
    }
  }
})();