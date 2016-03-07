(function(){
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('adminEditCtrl', adminEditCtrl);

  adminEditCtrl.$inject = ['Videos', '$scope', '$state'];

  function adminEditCtrl(Videos, $scope, $state) {
    get_video();

    function get_video() {
      Videos.get({id: $state.params.id})
        .$promise.then(function (data) {
        console.log(data);
          console.log('ajax success');
          console.log(data);
          $scope.video = data;


        })
        .catch(function (e) {
          console.log("ajax error " + e);
        });
    }

    function saveEdits() {
      $scope.video.$update(function(){

      })
    }


    //////////////////
    $scope.saveEdits = saveEdits;
  }

})();