(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .factory('Videos', Videos);

  Videos.$inject = ['$resource'];

  function Videos($resource) {
    return $resource('/api/videos/:id', {id: '@_id'}, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

