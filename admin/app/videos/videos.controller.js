(function () {
	'use strict';

	angular
		.module('AirvuzAdmin')
		.controller('VideosController', VideosController);

	VideosController.$inject = ['Videos', '$scope', 'confirmDelete'];

	function VideosController(Videos, $scope, confirmDelete) {

		function videoSearch(videoId){
			Videos.get({id: videoId}).$promise.then(function(vid){
				vm.videos.push(vid);
				$scope.videoId = '';
			});

		}

		function removeVideo(video) {
			var index = vm.videos.indexOf(video);
			confirmDelete().then(function(){
				//Do something if the user confirms
				video.$remove()
					.then(function () {
						vm.videos.splice(index, 1);
					});
			}, function(){
				//Do something else if the user cancels
			});
		}

		function editVideo(video) {
			window.location.href = '/editVideo/' + video._id;
		}

		function editComments(video) {
			window.location.href = '/admin/editComments/' + video._id;
		}

		function adminEdit(video) {
			window.location.href = '/admin/adminEdit/' + video._id;
		}

		////////////////////////
		var vm = this;
		vm.videoSearch = videoSearch;
		vm.adminEdit = adminEdit;
		vm.removeVideo = removeVideo;
		vm.editVideo = editVideo;
		vm.videos = [];
		vm.editComments = editComments;
	}
})();

