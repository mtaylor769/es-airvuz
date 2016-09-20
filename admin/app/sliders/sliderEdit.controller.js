(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('sliderEditController', sliderEditController);

    sliderEditController.$inject = ['Sliders', '$state', 'dialog', 'lodash', 'Amazon'];

    function sliderEditController(Sliders, $state, dialog, lodash, Amazon) {
        var sliderResource = Sliders.createResource('slider');
        var slideResource = Sliders.createResource('slide');
        getSliderById();

        function getSliderById() {
            sliderResource.get({id: $state.params.id})
                .$promise
                .then(function(data) {
                    vm.slider = data;
                    getAllSlides();
                }, function(error) {
                    dialog.serverError();
                })
        }

        function getAllSlides() {
            slideResource.query()
                .$promise
                .then(function(data) {
                    var slides = lodash.differenceBy(data, vm.slider.slides, '_id');
                    vm.slides = slides;
                }, function() {
                    dialog.serverError();
                })
        }

        function addSlideToSlider() {
            if(vm.slider.slides.indexOf(vm.slideSelect._id) === -1) {
                vm.slides.splice(lodash.indexOf(vm.slides, vm.slideSelect), 1);
                vm.slider.slides.push(vm.slideSelect);
            }
            vm.slideSelect = '';
        }

        function cancelEdit() {
            $state.go('sliders.sliders');
        }

        function saveSlider() {
            vm.slider.$update()
                .then(function() {
                    dialog.alert({
                        title: 'Saved',
                        content: 'Slide has been saved',
                        ok: 'OK'
                    });
                }, function(error) {
                    dialog.serverError();
                })
                .finally(function() {
                    $state.go('sliders.sliders');
                });
        }

        function removeSlide(slide) {
            vm.slider.slides.splice(lodash.indexOf(vm.slider.slides, slide), 1);
        }


    ////////////////////////
        var vm = this;
        vm.amazonBucket = '//s3-us-west-2.amazonaws.com/' + Amazon.assetBucket + '/slide/';
        vm.addSlideToSlider = addSlideToSlider;
        vm.cancelEdit = cancelEdit;
        vm.saveSlider = saveSlider;
        vm.removeSlide = removeSlide;
    }
})();