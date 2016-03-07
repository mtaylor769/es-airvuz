(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('staffVideoController', staffVideoController);

  staffVideoController.$inject = ['StaffVideos', '$http', '$scope'];

  function staffVideoController(StaffVideos, $http, $scope) {
    StaffVideos.query().$promise.then(function (videos) {
      console.log(videos);
      $scope.staffVideos = videos;
    });


    function addVideo(id) {
      var newVideo = new StaffVideos({staffpicksListId: id});
      newVideo.$save().then(function(video){
        $scope.staffVideos.push(video);
      }).catch(function(err){
        alert(err.data);
      })
    }

    function deleteVideo(video) {
      StaffVideos.delete({id: video._id}).$promise.then(function(){
        var index = $scope.staffVideos.indexOf(video);
        var remove = $scope.staffVideos.splice(index, 1);
      }).catch(function(err){
        alert(err.data);
      })
    }

    ///////////////////////
    $scope.addVideo = addVideo;
    $scope.deleteVideo = deleteVideo;
  }
})();