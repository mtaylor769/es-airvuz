(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .factory('Sliders', Sliders);

  Sliders.$inject = ['$resource'];

  function Sliders($resource) {
    function createResource(type) {
      return $resource('/api/' + type + '/:id', {id: '@_id'}, {
        update: {
          method: 'PUT'
        }
      });
    }

    return {
      createResource: createResource
    };
  }
})();

