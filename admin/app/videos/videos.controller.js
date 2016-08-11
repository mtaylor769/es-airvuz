(function () {
	'use strict';

	angular
		.module('AirvuzAdmin')
		.controller('VideosController', VideosController);

	VideosController.$inject = ['Videos', '$scope', 'confirmDelete', 'Amazon', 'identity'];

	function VideosController(Videos, $scope, confirmDelete, Amazon, identity) {

		function videoSearch(videoId){
			Videos.get({id: videoId}).$promise.then(function(video){
				vm.video = video;
				$scope.videoId = '';
				console.log(vm.videos);
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
			window.location.href = '/admin/editVideo/' + video._id;
		}

		function editComments(video) {
			window.location.href = '/admin/editComments/' + video._id;
		}

		function adminEdit(video) {
			window.location.href = '/admin/adminEdit/' + video._id;
		}

		function onProgress(progress) {
			$scope.$apply(function () {
				vm.uploadProgress = Math.round(progress * 10000) / 100;
			});
		}

		function onDurationReturn(duration) {
			currentUploadFile.duration = duration;
		}

		function onUploadComplete() {
			$.ajax({
				url: '/api/amazon/transcode/start',
				contentType : 'application/json',
				type: 'POST',
				data: JSON.stringify({key: currentUploadFile.hashName})
			}).done(pollVideoStatus);

			getVideoDuration();
		}

		function getVideoDuration() {
			$.ajax({
				url: '/api/amazon/video-duration',
				contentType : 'application/json',
				type: 'GET',
				data: {key: currentUploadFile.hashName}
			}).done(onDurationReturn)
		}

		function onUploadError() {
			alert('Error re-uploading');
		}
		
		function upload() {
			isUploading = true;
			currentUploadFile = $('#file-reupload')[0].files[0];
			var data = {file: {type: currentUploadFile.type, size: currentUploadFile.size, name: currentUploadFile.name}};

			var evaporate = new Evaporate({
				signerUrl : '/api/amazon/sign-auth',
				aws_key   : Amazon.ACCESS_KEY,
				bucket    : Amazon.inputBucket,
				aws_url   : 'https://s3-us-west-2.amazonaws.com'
			});

			$.ajax({
				url         : '/api/upload',
				contentType : 'application/json',
				type        : 'POST',
				data        : JSON.stringify(data)
			}).done(function (hashName) {
				currentUploadFile.hashName = hashName;

				evaporate.add({
					// headers
					contentType: currentUploadFile.type || 'binary/octet-stream',
					headersCommon: {
						'Cache-Control': 'max-age=3600'
					},
					signHeaders: {
						Authorization: 'Bearer ' + identity.getToken()
					},
					// filename, relative to bucket
					name: currentUploadFile.hashName + '.mp4',
					// content
					file: currentUploadFile,
					// event callbacks
					complete: onUploadComplete,
					progress: onProgress,
					error: onUploadError
				});
			});
		}

		/**
		 * Keep checking the server to see if the process success or fail
		 */
		function pollVideoStatus() {
			if (intervalHandler) {
				return;
			}

			intervalHandler = setInterval(function () {
				$.ajax({
					url         : '/api/upload/' + currentUploadFile.hashName,
					contentType : 'application/json',
					type        : 'GET'
				}).done(onTranscodeComplete)
					.fail(function () {
						transcodeError = true;
						//console.log('******************** Error: transcode ********************');
						// TODO: show dialog message - Unable to upload video. Try again or contact support
					})
					.always(function () {
						if (transcodeError === true || transcodeComplete === true) {
							clearTimeout(intervalHandler);
							intervalHandler = null;
							transcodeError = false;
							transcodeComplete = false;
						}
					});
			}, POLLING_INTERVAL_TIME);
		}

		function onTranscodeComplete(response) {
			if (response === 'processing') {
				return;
			}

			isUploading = false;
			transcodeComplete = true;

			var params = {
				videoPath: response.videoUrl,
				duration: currentUploadFile.duration,
				reupload: true
			};

			$.ajax({
				url         : '/api/videos/' + vm.video._id,
				contentType : 'application/json',
				type        : 'PUT',
				data        : JSON.stringify(params)
			}).done(function (video) {
				// TODO: remove old path
				alert('done re-uploading video');
			})
				.fail(function(){
					alert('fail to update video path');
				});
		}

		////////////////////////
		var vm = this;
		var currentUploadFile;
		var intervalHandler;
		var transcodeComplete;
		var transcodeError;
		var isUploading = false;
		var POLLING_INTERVAL_TIME = 20000; // 20 sec

		vm.file = null;
		vm.uploadProgress = 0;
		vm.showUploadForm = false;
		vm.videoSearch = videoSearch;
		vm.adminEdit = adminEdit;
		vm.removeVideo = removeVideo;
		vm.editVideo = editVideo;
		vm.videos = [];
		vm.bucketUrl = '//s3-us-west-2.amazonaws.com/airvuz-drone-video/';
		vm.editComments = editComments;
		vm.upload = upload;
	}
})();

