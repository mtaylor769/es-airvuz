(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('autoViewsListController', autoViewsListController);

  autoViewsListController.$inject = ['$http', 'Amazon', 'dialog'];

  function autoViewsListController($http, Amazon, dialog) {

    function getAutoViews() {
      $http.get('/api/auto-views').then(function(response) {
        vm.createdViews = response.data;
      }, function(error) {
        dialog.serverError();
      });
    }

    function setToComplete(id, index) {
      $http.put('/api/auto-views/' + id).then(function(response) {
        var holder = vm.createdViews.splice(index, 1);
      }, function(error) {
        dialog.serverError();
      });
    }

  ////////////////////////
    var vm = this;
    vm.amazonBucket = Amazon.outputUrl;

    vm.setToComplete = setToComplete;

    getAutoViews();
  }

})();