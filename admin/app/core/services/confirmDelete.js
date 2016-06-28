(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .factory('confirmDelete', confirmDelete)
    .factory('unAuthorized', unAuthorized);

  confirmDelete.$inject = ['$mdDialog'];
  unAuthorized.$inject = ['$mdDialog'];

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

  function unAuthorized($mdDialog) {
    return function() {
      var authError = $mdDialog.alert()
        .title('401 Unauthorized')
        .content('You are not authorized to make this action')
        .ok('OK');
      return $mdDialog.show(authError);
    }
  }
})();