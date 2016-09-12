(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('videoPercentageController', videoPercentageController);

    videoPercentageController.$inject = ['$http'];

    function videoPercentageController($http) {

        function getReportData() {
            vm.working = true;
            $http.get('/api/reports/video-percentage', {params: {videoId: vm.videoId, startDate: vm.startDate, endDate: vm.endDate}}).then(function(response) {
                console.log(response);
                vm.video = response.data;
                vm.working = false;
                vm.loaded = true;
            });
        }

    ///////////////
        var vm = this;
        vm.getReportData = getReportData;
    }
})();