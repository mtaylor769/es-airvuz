(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .factory('DroneType', DroneType);

  DroneType.$inject = ['$resource'];

  function DroneType($resource) {
    return $resource('/api/drone-type/:id', {id: '@_id'}, {
      update: {
        method: 'PUT'
      }
    });
  }
})();