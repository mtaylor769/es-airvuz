(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .factory('CameraType', CameraType);

  CameraType.$inject = ['$resource'];

  function CameraType($resource) {
    return $resource('/api/camera-type/:id', {id: '@_id'}, {
      update: {
        method: 'PUT'
      }
    });
  }
})();