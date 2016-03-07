(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .factory('Users', Users);

  Users.$inject = ['$resource'];

  function Users($resource) {
    return $resource('/api/users/:id', {id: '@_id'}, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

