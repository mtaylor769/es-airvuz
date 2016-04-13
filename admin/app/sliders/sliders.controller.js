(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('SlidersController', SlidersController);

  SlidersController.$inject = ['Sliders'];

  function SlidersController(Sliders) {
    var Slide = Sliders.createResource('slide');
    var Slider = Sliders.createResource('slider');

    function showForm(form) {
      vm.isOpen[form] = true;
    }

    function hideForm(form) {
      vm.isOpen[form] = false;

      if (form === 'slider') {
        return vm.newSlider = {
          slide: []
        };
      }
      vm.newSlide = {};
    }
    
    function save(type) {
      if (type === 'slide') {
        return saveSlide();
      }
      saveSlider();
    }

    function saveSlider() {
      angular.forEach(vm.newSlider.slide, function (slide, index) {
        vm.newSlider.slide[index] = slide._id;
      });
      var newSlider = new Slider(vm.newSlider);
      newSlider.$save(function () {
        vm.sliders.push(newSlider);
      });
    }
    
    function saveSlide() {
      var newSlide = new Slide(vm.newSlide);
      newSlide.$save(function () {
        vm.slides.push(newSlide);
      });
    }

    function addSlideToSlider() {
      if (vm.newSlider.slide) {
        return vm.newSlider.slide.push(vm.selectedSlide);
      }
      vm.newSlider.slide = [vm.selectedSlide];
    }
    
    function initialize() {
      Slide.query()
        .$promise
        .then(function (response) {
          vm.slides = response;
        });

      Slider.query()
        .$promise
        .then(function (response) {
          vm.sliders = response;
        })
    }
    
    ///////////////////////
    var vm = this;
    vm.showForm = showForm;
    vm.hideForm = hideForm;
    vm.selectedSlide = '';
    vm.newSlider = {
      slide: []
    };
    vm.newSlide = {};
    vm.save = save;
    vm.slides = [];
    vm.sliders = [];
    vm.addSlideToSlider = addSlideToSlider;
    vm.isOpen = {
      slider: false,
      slide: false
    };

    initialize();
  }
})();

