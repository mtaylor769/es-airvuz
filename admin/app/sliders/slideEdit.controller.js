(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('slideEditController', slideEditController);

    slideEditController.$inject = ['Sliders', '$state', 'Amazon', 'identity', '$q', 'dialog', '$http'];

    function slideEditController(Sliders, $state, Amazon, identity, $q, dialog, $http) {
        var slideResource = Sliders.createResource('slide');
        getSlideById();

        function getSlideById() {
            slideResource.get({id: $state.params.id})
                .$promise
                .then(function(data) {
                    vm.slide = data;
                })
                .catch(function() {
                   dialog.serverError();
                });
        }

        // function for new image
        function onStart(file) {
            vm.fileChosen = file.name;
            var part = file.name.split('.');
            return $q.when(md5(Date.now() + part[0]) + '.' + part[1]);
        }

        function onImageUploadProgress(file) {
            vm.imageUploadProgress = file.progress;
        }

        function onImageUploadComplete(file) {
            vm.slide.hashName = file.hashName;
            vm.slidePreviewSrc = file.url;
            vm.newImage = true;
            vm.srcReady = true;
        }

        function onImageUploadError(file, message) {
            dialog.alert({
                title: 'Error',
                content: message,
                ok: 'Ok'
            });
        }

        function cancelEdit() {
            $state.go('sliders.slides');
        }

        function saveSlide() {
            if(vm.newImage){
                var params = {
                    key: vm.slide.hashName,
                    dir: Amazon.assetBucket + '/slide'
                };

                $http.post('/api/amazon/move-file', params)
                    .then(function () {
                        vm.slide.imagePath = vm.slide.hashName;
                        return vm.slide.$update();
                    })
                    .then(function () {
                        dialog.alert({
                            title: 'Saved',
                            content: 'Slide has been saved',
                            ok: 'OK'
                        });
                    })
                    .catch(function(error) {
                        dialog.serverError();
                    })
                    .finally(function () {
                        $state.go('sliders.slides');
                    });
            } else {
                vm.slide.$update()
                    .then(function () {
                        dialog.alert({
                            title: 'Saved',
                            content: 'Slide has been saved',
                            ok: 'OK'
                        });
                    })
                    .catch(function(error) {
                        dialog.serverError();
                    })
                    .finally(function () {
                        $state.go('sliders.slides');
                    });
            }

        }

    ////////////////////////
        var vm = this;
        vm.amazonBucket = '//s3-us-west-2.amazonaws.com/' + Amazon.assetBucket + '/slide/';
        vm.cancelEdit = cancelEdit;
        vm.saveSlide = saveSlide;

        vm.evaData = {
            headersCommon: {
                'Cache-Control': 'max-age=604800' // 1 week
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