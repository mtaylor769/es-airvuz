(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('topViewsController', topViewsController);

    topViewsController.$inject = ['$http'];

    function topViewsController($http) {

        function getTopViews() {
            vm.videos = []; // clear previous result
            vm.working = true;
            var data = {};
            data.startDate = vm.startDate;
            data.endDate = vm.endDate;
            data.limit = vm.limit;
            $http.post('/api/reports/top-views', data).then(function(response) {
                var videos = response.data;
                videos.forEach(function(video) {
                    var categories = video.videoObject.categories;
                    var internalFlag = categories.map(function(category) {
                        if(category === '574f91b3b55602296def65b1' || category === '574f91b3b55602296def65b4' || category === '574f91b3b55602296def65bb'){
                            video.internalFlag = true;
                            return video;
                        }
                    })
                });
                vm.working = false;
                vm.videos = videos;
                vm.top100 = true;
            })
        }

        function setOrder(orderBy) {
            vm.orderBy = (vm.orderBy === orderBy ? '-' : '') + orderBy;
        }


    //////////////////////////////
        var vm = this;
        vm.top100Input = true;
        vm.orderBy = '-count';
        vm.getTopViews = getTopViews;
        vm.setOrder = setOrder;
    }
})();