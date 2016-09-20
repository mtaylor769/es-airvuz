(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('newSliderController', newSliderController);

    newSliderController.$inject = ['Sliders', 'Amazon', 'dialog'];

    function newSliderController(Sliders, Amazon, dialog) {
        var slideResource = Sliders.createResource('slide');
        var sliderResource = Sliders.createResource('slider');
        getSlides();

        function getSlides() {
            slideResource.query()
                .$promise
                .then(function(data) {
                    vm.slides = data;
                })
                .catch(function() {
                    dialog.serverError();
                });
        }

        function saveSlider() {
            var slider = new sliderResource(vm.newSlider);
            slider.$save(function() {
                dialog.alert({
                    title: 'Slider Saved',
                    content: 'Slider was successfully saved',
                    ok: 'Ok'
                });
                vm.newSlider = {};
                vm.slideStage = [];
                vm.newSlider.slides = [];
                vm.slidePreview = false;
            }, function(error) {
                dialog.serverError();
            });
        }

        function addSlideToSlider() {
            if(vm.newSlider.slides.indexOf(vm.slideSelect._id) === -1 && vm.slideStage.indexOf(vm.slideSelect._id) === -1) {
                var removeIndex = vm.slides.indexOf(vm.slideSelect);
                vm.slides.splice(removeIndex,1);
                vm.newSlider.slides.push(vm.slideSelect._id);
                vm.slideStage.push(vm.slideSelect);
                vm.slidePreview = true;
            }
            vm.slideSelect = '';
        }

        function removeSlide(slide) {
            vm.slides.push(slide);
            var removeIdIndex = vm.newSlider.slides.indexOf(slide._id);
            var removeStageIndex = vm.slideStage.indexOf(slide);
            vm.newSlider.slides.splice(removeIdIndex, 1);
            vm.slideStage.splice(removeStageIndex, 1);
            if(vm.slideStage.length === 0) {
                vm.slidePreview = false;
            }
        }


    /////////////////
        var vm = this;
        vm.newSlider = {};
        vm.slideStage = [];
        vm.newSlider.slides = [];
        vm.amazonBucket = '//s3-us-west-2.amazonaws.com/' + Amazon.assetBucket + '/slide/';
        vm.saveSlider = saveSlider;
        vm.addSlideToSlider = addSlideToSlider;
        vm.removeSlide = removeSlide;
    }

})();