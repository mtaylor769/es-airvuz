(function() {
  'use strict';
  
  angular
    .module('AirvuzAdmin')
    .controller('editVideoController', editVideoController);
  
  editVideoController.$inject = ['Videos', 'CameraType', 'DroneType', 'CategoryType', 'dialog', '$state'];
  
  function editVideoController(Videos, CameraType, DroneType, CategoryType, dialog, $state) {
    getVideo();
    getCameraTypes();
    getDroneTypes();
    getCategoryType();

    function getVideo() {
      Videos
        .get({id: $state.params.id})
        .$promise
        .then(function (data) {
        vm.video = data;
        })
        .catch(function (e) {
        });
    }

    function getCameraTypes() {
      CameraType
        .query()
        .$promise
        .then(function(data) {
          vm.cameraType = data;
        })
    }

    function getDroneTypes() {
      DroneType
        .query()
        .$promise
        .then(function(data) {
          vm.droneType = data;
        })
    }

    function getCategoryType() {
      CategoryType
        .query()
        .$promise
        .then(function(data) {
          vm.categoryType = data;
        })
    }
    
    function addCategory(category) {
      if(vm.video.categories.length < 3) {
        category = JSON.parse(category);
        var categoryCheck = vm.video.categories.map(function(_category) {return _category._id}).indexOf(category._id);
        if(categoryCheck === -1) {
          vm.video.categories.push(category);
        } else {
          dialog.alert({
            title: 'Category Already Selected',
            content: 'You have already selected this category for this video',
            ok: 'Ok'
          })
        }
      } else {
        dialog.alert({
          title: 'Maximum Categories',
          content: 'The limit for categories is 3. Please remove a category to add another',
          ok: 'Ok'
        })
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