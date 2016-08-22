(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('topViewsController', topViewsController);

    topViewsController.$inject = ['$http'];

    function topViewsController($http) {

        function getTopViews() {
            var data = {};
            data.startDate = vm.startDate;
            data.endDate = vm.endDate;
            data.limit = vm.limit;
            $http.post('/api/reports/top-views', data).then(function(response) {
                var videos = response.data;
                videos.forEach(function(video) {
                    var categories = video.videoObject.categories;
                    var internalFlag = categories.map(function(category) {
                        if(category._id === '574f91b3b55602296def65b1' || category._id === '574f91b3b55602296def65b4' || category._id === '574f91b3b55602296def65bb'){
                            video.internalFlag = true;
                            return video;
                        }
                    })
                });
                vm.videos = videos;
                vm.top100 = true;
            })
        }


    //////////////////////////////
        var vm = this;
        vm.top100Input = true;
        vm.getTopViews = getTopViews;
    }
})();