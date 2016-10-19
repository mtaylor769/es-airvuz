(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('carouselViewAllController', carouselViewAllController);

    carouselViewAllController.$inject = ['dialog', 'Amazon', 'customCarousel', '$state'];

    function carouselViewAllController(dialog, Amazon, customCarousel, $state) {
        getAllCarousels();

        function getAllCarousels() {
            customCarousel.query()
              .$promise
              .then(function(carousels) {
                  vm.carousels = carousels;
              }, function(error) {
                  dialog.serverError();
              });
        }

        function deleteCarousel(carousel) {
          customCarousel.delete({id: carousel._id})
            .$promise
            .then(function() {
              var removeIndex = vm.carousels.indexOf(carousel);
              vm.carousels.splice(removeIndex, 1);
            })
        }

        function editCarousel(id) {
          $state.go('customCarousel.edit', {id: id})
        }


        //////////////////////
        var vm = this;
        vm.amazonBucket = '//s3-us-west-2.amazonaws.com/' + Amazon.assetBucket + '/';
        vm.deleteCarousel = deleteCarousel;
        vm.editCarousel = editCarousel;
    }
})();