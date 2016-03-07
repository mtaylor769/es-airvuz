(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('featuredVideoController', featuredVideoController);

  featuredVideoController.$inject = ['FeaturedVideos', '$scope'];

  function featuredVideoController(FeaturedVideos, $scope) {
    FeaturedVideos.query().$promise.then(function (videos) {
      console.log(videos);
      $scope.featuredVideos = videos;
    });


    function addVideo(id) {
      var newVideo = new FeaturedVideos({featureVideoListId: id});
      newVideo.$save().then(function(video){
        $scope.featuredVideos.push(video);
      }).catch(function(err){
        alert(err.data);
      })
    }

    function deleteVideo(video) {
      FeaturedVideos.delete({id: video._id}).$promise.then(function(){
        var index = $scope.featuredVideos.indexOf(video);
        var remove = $scope.featuredVideos.splice(index, 1);
      }).catch(function(err){
        console.log(err);
        alert(err.data);
      })
    }

    ///////////////////////
    $scope.addVideo = addVideo;
    $scope.deleteVideo = deleteVideo;
  }
})();