(function() {
  'use strict';
  
  angular
    .module('AirvuzAdmin')
    .controller('editVideoController', editVideoController);
  
  editVideoController.$inject = ['Videos', 'CameraType', 'DroneType', 'CategoryType' ,'$state'];
  
  function editVideoController(Videos, CameraType, DroneType, CategoryType, $state) {
    get_video();
    get_cameraTypes();
    get_droneTypes();
    get_categoryType();

    function get_video() {
      Videos
        .get({id: $state.params.id})
        .$promise
        .then(function (data) {
        vm.video = data;
        })
        .catch(function (e) {
        });
    }

    function get_cameraTypes() {
      CameraType
        .query()
        .$promise
        .then(function(data) {
          vm.cameraType = data;
        })
    }

    function get_droneTypes() {
      DroneType
        .query()
        .$promise
        .then(function(data) {
          vm.droneType = data;
        })
    }

    function get_categoryType() {
      CategoryType
        .query()
        .$promise
        .then(function(data) {
          vm.categoryType = data;
        })
    }

    function addCategory(id) {
      if(vm.video.categories.length < 3) {
        vm.video.categories.push(JSON.parse(id));
      } else {
        alert('max categories reached');
      }
    }

    function deleteCategory(id) {
      var objectToRemove = vm.video.categories.indexOf(id);
      vm.video.categories.splice(objectToRemove, 1);
    }

    function saveVideo() {
      var video = vm.video;
      Videos
        .update(video)
    }

    /////////////////
    var vm = this;
    vm.addCategory = addCategory;
    vm.deleteCategory = deleteCategory;
    vm.saveVideo = saveVideo;
  }
})();