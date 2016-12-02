(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('autoViewsSearchController', autoViewsSearchController);

  autoViewsSearchController.$inject = ['$http', 'Amazon', 'dialog'];

  function autoViewsSearchController($http, Amazon, dialog) {

    function searchForAutoViews() {
      var videoId = vm.videoId;
      $http.get('/api/auto-views/' + videoId).then(function(response) {
        vm.views = response.data;
      }, function(error) {
        dialog.serverError();
      });
    }

    function setToComplete(id) {
      $http.put('/api/auto-views/' + id).then(function(response) {
        vm.views.forEach(function(view) {
          if(view._id === id) {
            view.isComplete = true;
          }
        });
      }, function(error) {
        dialog.serverError();
      });
    }


  ////////////////////////
    var vm = this;
    vm.amazonBucket = Amazon.outputUrl;

    vm.searchForAutoViews = searchForAutoViews;
    vm.setToComplete = setToComplete;
  }
})();