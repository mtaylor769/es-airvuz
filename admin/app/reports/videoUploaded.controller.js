(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('videoUploadedController', videoUploadedController);

    videoUploadedController.$inject = ['$http'];

    function videoUploadedController($http) {

        function getVideos(username,startDate, endDate) {
            vm.siteInfo = false;
            vm.videos = false;
            vm.comments = false;
            vm.working = true;
            $http.get('/api/reports/videos', {params: {username: username, startDate: startDate, endDate: endDate}})
                .success(function(data){
                    vm.videosUsername = username;
                    vm.videoCount = data.length;
                    vm.videosStartDate = startDate;
                    vm.videosEndDate = endDate;
                    vm.working = false;
                    vm.videos = true;
                })
        }

    ////////////////////////////
        var vm = this;
        vm.getVideos = getVideos;
        vm.videosInput = true;
    }
})();