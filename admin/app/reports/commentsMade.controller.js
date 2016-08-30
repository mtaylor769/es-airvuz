(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('commentsMadeController', commentsMadeController);

    commentsMadeController.$inject = ['$http'];

    function commentsMadeController($http) {

        function getComments(username,startDate, endDate){
            vm.siteInfo = false;
            vm.videos = false;
            vm.comments = false;
            vm.working = true;
            $http.get('/api/reports/comments', {params: {username: username, startDate: startDate, endDate: endDate}})
                .success(function(data){
                    vm.commentsUsername = username;
                    vm.commentsCommentCount = data.commentCount;
                    vm.commentsStartDate = startDate;
                    vm.commentsEndDate = endDate;
                    vm.working = false;
                    vm.comments = true;

                })
        }

    ////////////////////////////
        var vm = this;
        vm.getComments = getComments;
        vm.commentsInput = true;

    }
})();