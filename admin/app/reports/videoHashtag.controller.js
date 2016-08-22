(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('videoHashtagController', videoHashtagController);

    videoHashtagController.$inject = ['$http'];

    function videoHashtagController($http) {

        function getVideoHashcodes(startDate, endDate, hashtag) {
            vm.working = true;
            var data = {};
            data.startDate = startDate;
            data.endDate = endDate;
            data.hashTag = hashtag;
            $http.post('/api/reports/hashtag', data)
                .success(function(data) {
                    console.log(data);
                    if(data.length > 20) {
                        var topVideos = data.splice(0, 20);
                    } else {
                        var topVideos = data;
                    }
                    vm.working = false;
                    vm.hashtagVideoReport = true;
                    vm.hashtagVideoDisplay = topVideos;
                })
        }

    ////////////////////////////
        var vm = this;
        vm.getVideoHashcodes = getVideoHashcodes;
        vm.hashtagVideoReportInput = true;
    }
})();