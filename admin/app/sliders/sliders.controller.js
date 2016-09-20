(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('slidersController', slidersController);

    slidersController.$inject = ['Sliders', 'dialog', '$state', 'lodash'];

    function slidersController(Sliders, dialog, $state, lodash) {
        var sliderResource = Sliders.createResource('slider');
        getAllSliders();

        function getAllSliders() {
            sliderResource.query()
                .$promise
                .then(function(data) {
                    vm.sliders = data;
                }, function() {
                    dialog.serverError();
                });
        }

        function editSlider(slider) {
            $state.go('sliders.sliderEdit', {id: slider._id});
        }

        function deleteSlider(slide) {
            slide.$delete()
                .then(function() {
                    vm.sliders.splice(lodash.indexOf(vm.sliders, slide), 1);
                })
        }


    ////////////////////
        var vm = this;
        vm.editSlider = editSlider;
        vm.deleteSlider = deleteSlider;

    }

})();