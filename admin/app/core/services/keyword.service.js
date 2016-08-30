(function () {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .factory('KeywordSearch', KeywordSearch);

    KeywordSearch.$inject = ['$resource'];

    function KeywordSearch($resource) {
        return $resource('/api/keyword/:keyword', {keyword: 'keyword'}, {
            update: {
                method: 'PUT'
            }
        });
    }
})();