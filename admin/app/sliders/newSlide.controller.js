(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('newSlideController', newSlideController);

    newSlideController.$inject = ['Sliders', '$q', '$http', 'Amazon', 'identity', 'dialog'];

    function newSlideController(Sliders, $q, $http, Amazon, identity, dialog) {

    //functions for image upload
    function onStart(file) {
        vm.fileChosen = file.name;
        var part = file.name.split('.');
        return $q.when(md5(Date.now() + part[0]) + '.' + part[1]);
    }

    function onImageUploadProgress(file) {
        vm.imageUploadProgress = file.progress;
    }

    function onImageUploadComplete(file) {
        vm.newSlide.hashName = file.hashName;
        vm.slidePreviewSrc = file.url;
        vm.srcReady = true;
    }

    function onImageUploadError(file, message) {
        dialog.serverError();
    }

    function saveSlide() {
        var params = {
            key: vm.newSlide.hashName,
            dir: Amazon.assetBucket + '/slide'
        };

        $http.post('/api/amazon/move-file', params)
            .then(function () {
                vm.newSlide.imagePath = vm.newSlide.hashName;
                var newSlide = new Slide(vm.newSlide);
                newSlide.$save(function () {
                    dialog.alert({
                        title: 'Slide Saved',
                        content: 'Slide was successfully saved',
                        ok: 'Ok'
                    });
                    vm.newSlide = {};
                    vm.imageUploadProgress = 0;
                    vm.slidePreviewSrc = '';
                    vm.srcReady = false;
                    vm.fileChosen = 'No File Chosen';

                });
            }, function() {
                dialog.serverError();
            });
    }
    ////////////////////
        var vm = this;
        var Slide = Sliders.createResource('slide');
        vm.newSlide = {};
        vm.fileChosen = 'No File Chosen';
        vm.saveSlide = saveSlide;


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