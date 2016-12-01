(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('commentEditController', commentEditController);

    commentEditController.$inject = ['$state', '$http'];

    function commentEditController($state, $http) {
        getVideoComments();

        function getVideoComments() {
            $http.get('/api/edit-comments', {params: {videoId: $state.params.video._id}}).then(function(response) {
                vm.comments = response.data;
            });
        }

        function deleteComment(commentId, index, parentIndex) {
            $http.delete('/api/comment/' + commentId).then(function() {
                if(typeof parentIndex !== 'undefined') {
                    vm.comments[parentIndex].childComments.splice(index, 1);
                } else {
                    vm.comments.splice(index, 1);
                }
            });
        }

        ////////////
        var vm = this;
        vm.video = $state.params.video;
        vm.deleteComment = deleteComment
    }
})();