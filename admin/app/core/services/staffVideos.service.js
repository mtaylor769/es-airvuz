(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .factory('StaffVideos', StaffVideos);

  StaffVideos.$inject = ['$resource'];

  function StaffVideos($resource) {
    return $resource('/api/staff-videos/:id', {id: '@_id'}, {
      update: {
        method: 'PUT'
      }
    });
  }
})();