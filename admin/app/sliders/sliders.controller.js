(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('SlidersController', SlidersController);

  SlidersController.$inject = ['Sliders', '$q', '$http', 'Amazon'];

  function SlidersController(Sliders, $q, $http, Amazon) {
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
      vm.imageUploadProgress = 0;
    }
    
    function save(type) {
      if (type === 'slide') {
        return saveSlide();
      }
      saveSlider();
    }

    function saveSlider() {
      angular.forEach(vm.newSlider.slides, function (slide, index) {
        vm.newSlider.slides[index] = slide._id;
      });
      var newSlider = new Slider(vm.newSlider);
      newSlider.$save(function () {
        vm.sliders.push(newSlider);
      });
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
            vm.slides.push(newSlide);
            hideForm('slide');
          });
        });
    }

    function addSlideToSlider() {
      if (vm.newSlider.slides) {
        return vm.newSlider.slides.push(vm.selectedSlide);
      }
      vm.newSlider.slides = [vm.selectedSlide];
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
    function onStart(file) {
      var part = file.name.split('.');
      return $q.when(md5(Date.now() + part[0]) + '.' + part[1]);
    }

    function onImageUploadProgress(file) {
      vm.imageUploadProgress = file.progress;
    }

    function onImageUploadComplete(file) {
      vm.newSlide.hashName = file.hashName;
    }

    function onImageUploadError(file, message) {
      console.log('******************** file, message ********************');
      console.log(file, message);
      console.log('************************************************');
    }

    function editSlider(slider) {
      showForm('slider');
      vm.newSlider = slider;
    }

    function removeSlider(slider) {
      var index = vm.sliders.indexOf(slider);

      slider.$remove(function () {
        vm.sliders.splice(index, 1);
      });
    }

    function removeSlide(slide) {
      var index = vm.slides.indexOf(slide);

      slide.$remove(function () {
        vm.slides.splice(index, 1);
      });
    }

    function editSlide() {

    }
    
    ///////////////////////
    var vm = this;
    vm.showForm = showForm;
    vm.hideForm = hideForm;
    vm.selectedSlide = '';
    vm.newSlider = {
      slides: []
    };
    vm.newSlide = {};
    vm.save = save;
    vm.slides = [];
    vm.sliders = [];
    vm.addSlideToSlider = addSlideToSlider;
    vm.removeSlider = removeSlider;
    vm.editSlider = editSlider;
    vm.removeSlide = removeSlide;
    vm.editSlide = editSlide;
    vm.isOpen = {
      slider: false,
      slide: false
    };

    vm.imageUploadProgress = 0;

    vm.evaData = {
      headersCommon: {
        'Cache-Control': 'max-age=3600'
      },
      headersSigned: {
        'x-amz-acl': 'public-read'
      },
      onStart: onStart,
      onFileProgress: onImageUploadProgress,
      onFileComplete: onImageUploadComplete,
      onFileError: onImageUploadError
    };

    initialize();
  }
})();

