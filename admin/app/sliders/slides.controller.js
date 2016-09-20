(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('slidesController', slidesController);

    slidesController.$inject = ['Sliders', 'Amazon', '$state', 'dialog'];

    function slidesController(Sliders, Amazon, $state, dialog) {
        var slideResource = Sliders.createResource('slide');
        getAllSlides();

        function getAllSlides() {
            slideResource.query()
                .$promise
                .then(function(data) {
                    vm.slides = data;
                }, function() {
                    dialog.serverError();
                });
        }

        function editSlide(slide) {
            $state.go('sliders.slideEdit', {id: slide._id});
        }

        function deleteSlide(slide) {
            var removeIndex = vm.slides.indexOf(slide);
            slide.$delete({id: slide._id})
                .then(function() {
                    vm.slides.splice(removeIndex, 1);
                    dialog.alert({
                        title: 'Deleted',
                        content: 'Slide Successfully Deleted',
                        ok: 'OK'
                    });
                }, function() {
                    dialog.serverError();
                });
        }

    ////////////////////////
        var vm = this;
        vm.amazonBucket = '//s3-us-west-2.amazonaws.com/' + Amazon.assetBucket + '/slide/';
        vm.editSlide = editSlide;
        vm.deleteSlide = deleteSlide;
    }
})();