(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('userHashtagController', userHashtagController);

    userHashtagController.$inject = ['$http'];

    function userHashtagController($http) {

        function getUserHashCodes(startDate, endDate, hashtag) {
            var data = {};
            data.startDate = startDate;
            data.endDate = endDate;
            data.hashtag = hashtag;
            $http.post('/api/reports/user-hashtag', data)
                .success(function(data) {
                    vm.hashtagUserDisplay = data;
                    vm.hashtagUserReport = true;
                })
        }

    ////////////////////////////
        var vm = this;
        vm.getUserHashCodes = getUserHashCodes;
        vm.hashtagUserReportInput = true;
    }
})();