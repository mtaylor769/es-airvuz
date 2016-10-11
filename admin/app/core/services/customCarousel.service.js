(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .factory('customCarousel', customCarousel);

  customCarousel.$inject = ['$resource'];

  function customCarousel($resource) {
    return $resource('/api/custom-carousel/:id', {id: '@_id'}, {
      update: {
        method: 'PUT'
      }
    });
  }
})();