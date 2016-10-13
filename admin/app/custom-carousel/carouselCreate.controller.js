(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('carouselCreateController', carouselCreateController);

    carouselCreateController.$inject = ['Videos', 'dialog', 'Amazon', '$http', '$q', 'identity', '$state'];

    function carouselCreateController(Videos, dialog, Amazon, $http, $q, identity, $state) {

        function onStart(file) {
            vm.fileChosen = file.name;
            var part = file.name.split('.');
            return $q.when(md5(Date.now() + part[0]) + '.' + part[1]);
        }

        function onImageUploadProgress(file) {
            vm.imageUploadProgress = file.progress;
        }

        function onImageUploadComplete(file) {
            vm.displayImage.hashname = file.hashName;
            vm.slidePreviewSrc = file.url;
            vm.srcReady = true;
        }

        function onImageUploadError(file, message) {
            dialog.serverError();
        }

        function getVideoById() {
                Videos.get({id: vm.videoId})
                    .$promise
                    .then(function(video) {
                        if(vm.stagedVideos.indexOf(video) === -1 && vm.carousel.videos.indexOf(video._id) === -1) {
                            vm.stagedVideos.push(video);
                            vm.carousel.videos.push(video._id);
                        } else {
                            dialog.alert({
                                title: 'Video already added',
                                content: 'This video was already added to the carousel',
                                ok: 'ok'
                            })
                        }
                        vm.videoId = '';
                    }, function(error) {
                        dialog.serverError();
                    });
        }

        function saveCarousel() {
            if(vm.carousel.displayImage) {
                var params = {
                    key: vm.displayImage.hashname,
                    dir: Amazon.assetBucket + '/videoCollection'
                };
                $http.post('/api/amazon/move-file', params)
                  .then(function() {
                      vm.carousel.homepageDisplay = vm.homepageDisplay;
                      $http.post('/api/custom-carousel', vm.carousel)
                        .then(function(response) {
                            $state.go('customCarousel.all');
                        }, function(error) {
                            dialog.serverError();
                        });
                  }, function(error) {
                      dialog.serverError();
                  });
            } else {
                vm.carousel.homepageDisplay = vm.homepageDisplay;
                $http.post('/api/custom-carousel', vm.carousel)
                  .then(function(response) {
                      $state.go('customCarousel.all');
                  }, function(error) {
                      dialog.serverError();
                  });
            }

        }


        function createCarousel() {
            if(vm.videoInput && typeof vm.carousel.displayVideoId !== 'undefined' && vm.carousel.displayVideoId !== '') {
                Videos.get({id: vm.carousel.displayVideoId})
                  .$promise
                  .then(function(video) {
                      if(video && vm.carousel.videos.length > 0) {
                          vm.carousel.displayVideo = vm.carousel.displayVideoId;
                          saveCarousel();
                      } else {
                          dialog.alert({
                              title: 'No Videos',
                              content: 'Please select videos for the carousel',
                              ok: 'ok'
                          });
                      }
                  }, function() {
                      dialog.alert({
                          title: 'Invalid Entry',
                          content: 'Please add a valid Video Id',
                          ok: 'ok'
                      });
                  });
            } else if(vm.imageInput && typeof vm.displayImage.hashname !== 'undefined' && vm.displayImage.hashname !== '') {
                if(vm.carousel.videos.length > 0) {
                    vm.carousel.displayImage = vm.displayImage.hashname;
                    saveCarousel();
                } else {
                    dialog.alert({
                        title: 'No Videos',
                        content: 'Please select videos for the carousel',
                        ok: 'ok'
                    });
                }
            } else {
                if(vm.videoInput) {
                    dialog.alert({
                        title: 'Invalid entry',
                        content: 'Please enter a valid video Id',
                        ok: 'ok'
                    });
                } else if(vm.imageInput) {
                    dialog.alert({
                        title: 'Invalid entry',
                        content: 'Please select a banner image',
                        ok: 'ok'
                    });
                } else {
                    dialog.alert({
                        title: 'Banner Selection Required',
                        content: 'Please select a banner option',
                        ok: 'ok'
                    });
                }
            }
        }

        function removeVideo(videoId, video) {
            var videosIndex = vm.carousel.videos.indexOf(videoId);
            var stagedIndex = vm.stagedVideos.indexOf(video);
            vm.carousel.videos.splice(videosIndex, 1);
            vm.stagedVideos.splice(stagedIndex, 1)
        }



    //////////////////////
        var vm = this;
        vm.carousel = {};
        vm.displayImage = {};
        vm.carousel.videos = [];
        vm.stagedVideos = [];
        vm.amazonBucket = '//s3-us-west-2.amazonaws.com/' + Amazon.outputBucket + '/';
        vm.homepageDisplay = false;
        vm.videoInput = false;
        vm.imageInput = false;
        vm.fileChosen = 'No File Chosen';
        vm.getVideoById = getVideoById;
        vm.createCarousel = createCarousel;
        vm.removeVideo = removeVideo;



        vm.imageUploadProgress = 0;

        vm.evaData = {
            headersCommon: {
                'Cache-Control': 'max-age=3600'
            },
            headersSigned: {
                'x-amz-acl': 'public-read'
            },
            signHeaders: {
                Authorization: 'Bearer ' + identity.getToken()
            },
            onStart: onStart,
            onFileProgress: onImageUploadProgress,
            onFileComplete: onImageUploadComplete,
            onFileError: onImageUploadError
        };
    }
})();