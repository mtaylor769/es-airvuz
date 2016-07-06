(function() {
  'use strict';
  
  angular
    .module('AirvuzAdmin')
    .controller('editVideoController', editVideoController);
  
  editVideoController.$inject = ['Videos', '$scope', '$state'];
  
  function editVideoController(Videos, $scope, $state) {
    get_video();

    function get_video() {
      Videos
        .get({id: $state.params.id})
        .$promise
        .then(function (data) {
        console.log(data);
        $scope.video = data;
        })
        .catch(function (e) {
          console.log("ajax error " + e);
        });
    }

    /////////////////
    var vm = this;
  }
})();