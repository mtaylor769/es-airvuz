(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .directive('fileUpload', fileUpload);

    function fileUpload() {
        return {
            restrict: 'A',
            link: function(scope, element) {
                element.bind('click', function(e) {
                    angular.element(e.currentTarget).siblings('#upload-file').trigger('click');
                });
            }
        };
    }
})();