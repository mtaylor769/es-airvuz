(function() {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .factory('FeaturedVideos', FeaturedVideos);

  FeaturedVideos.$inject = ['$resource'];

  function FeaturedVideos($resource) {
    return $resource('/api/featured-videos/:id', {id: '@_id'}, {
      update: {
        method: 'PUT'
      }
    });
  }
})();