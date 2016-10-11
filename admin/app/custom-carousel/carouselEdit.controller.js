(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('carouselEditController', carouselEditController);

    carouselEditController.$inject = ['$state', '$http', 'customCarousel', 'Videos', 'Amazon', 'identity', '$q', 'dialog'];

    function carouselEditController($state, $http, customCarousel, Videos, Amazon, identity, $q, dialog) {
        getCarousel();

        function getCarousel() {
            customCarousel.get({id: $state.params.id})
              .$promise
              .then(function(carousel) {
                  vm.carousel = carousel;
                  vm.stagedVideos = carousel.videos;
                  if(carousel.startDate && carousel.endDate) {
                      vm.homepageDisplay = true;
                  }
                  if(carousel.displayVideo) {
                      vm.videoInput = true;
                      vm.carousel.displayVideoId = carousel.displayVideo;
                  } else {
                      vm.imageInput = true;
                      vm.slidePreviewSrc = vm.amazonAssetBucket + '/' + carousel.displayImage;
                      vm.srcReady = true;
                  }
              })
        }

        function onStart(file) {
            vm.fileChosen = file.name;
            var part = file.name.split('.');
            return $q.when(md5(Date.now() + part[0]) + '.' + part[1]);
        }

        function onImageUploadProgress(file) {
            vm.imageUploadProgress = file.progress;
        }

        function onImageUploadComplete(file) {
            vm.carousel.displayImage = file.hashName;
            vm.imageUpdated = true;
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
                  if(vm.carousel.videos.indexOf(video) === -1) {
                      vm.carousel.videos.push(video);
                      vm.videoId = '';
                  } else {
                      dialog.alert({
                          title: 'Video already in carousel',
                          content: 'This video has already been selected. Duplicates are not allowed.',
                          ok: 'ok'
                      });
                      vm.videoId = '';
                  }
              }, function(error) {
                  dialog.serverError();
              });
        }

        function removeVideo(video) {
            var removeIndex = vm.carousel.videos.indexOf(video);
            vm.carousel.videos.splice(removeIndex, 1);
        }

        function saveCarousel() {
          vm.carousel.homepageDisplay = vm.homepageDisplay;
          if(vm.imageUpdated === true) {
            vm.carousel.displayVideo = null;
            var params = {
                key: vm.carousel.displayImage,
                dir: Amazon.assetBucket + '/videoCollection'
            };
            $http.post('/api/amazon/move-file', params)
              .then(function() {
                vm.carousel.displayVideo = null;
                return vm.carousel.$update()
              })
              .then(function() {
                  $state.go('customCarousel.all')
              })
              .catch(function(error) {
                  dialog.serverError();
              })
          } else {
            if(vm.videoInput) {
              vm.carousel.displayImage = null;
            }
              vm.carousel.$update()
                .then(function(data) {
                    $state.go('customCarousel.all')
                }, function(error) {
                    dialog.serverError();
                });
          }
        }

        function carouselValidation() {
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
          } else if(vm.imageInput && typeof vm.carousel.displayImage !== 'undefined' && vm.carousel.displayImage !== '') {
            if(vm.carousel.videos.length > 0) {
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

        //////////////////////
        var vm = this;
        vm.amazonOutputBucket = '//s3-us-west-2.amazonaws.com/' + Amazon.outputBucket + '/';
        vm.amazonAssetBucket = '//s3-us-west-2.amazonaws.com/' + Amazon.assetBucket + '/videoCollection';
        vm.carouselValidation = carouselValidation;
        vm.getVideoById = getVideoById;
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