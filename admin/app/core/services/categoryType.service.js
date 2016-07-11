(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .factory('CategoryType', CategoryType);

  CategoryType.$inject = ['$resource'];

  function CategoryType($resource) {
    return $resource('/api/category-type', {
      update: {
        method: 'PUT'
      }
    });
  }
})();