(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('siteInfoController', siteInfoController);

    siteInfoController.$inject = ['$http'];

    function siteInfoController($http) {

        function getSiteInfo(siteInfoStartDate, siteInfoEndDate) {
            vm.siteInfo = false;
            vm.videos = false;
            vm.comments = false;
            vm.loading = true;
            $http.get('/api/reports/site-info', { params: {startDate: siteInfoStartDate, endDate: siteInfoEndDate}})
                .success(function(data){
                    console.log(data);
                    var newUsersArray = [];
                    data.newUsersList.forEach(function(user){
                        user.email = typeof user.emailAddress != 'undefined' ? user.emailAddress : '';
                        user.user_name = typeof user.userNameDisplay != 'undefined' ? user.userNameDisplay : '';
                        user.urlName = typeof user.userNameUrl != 'undefined' ? user.userNameUrl : '';
                        user.joining_date = typeof user.accountCreatedDate != 'undefined' ? user.accountCreatedDate : '';
                        user.allowDonation = typeof user.allowDonation != 'undefined' ? user.allowDonation : '';
                        user.allowHire = typeof user.allowHire != 'undefined' ? user.allowHire : '';
                        newUsersArray.push(user);
                    });
                    vm.title = data.title;
                    vm.totalUsers = data.totalUsers;
                    vm.totalVideos = data.totalVideos;
                    vm.newUsersCount = data.newUsersCount;
                    vm.newVideos = data.newVideos;
                    vm.siteInfoStartDate = siteInfoStartDate;
                    vm.siteInfoEndDate = siteInfoEndDate;
                    vm.newUsers = newUsersArray;
                    vm.loading = false;
                    vm.siteInfo = true;
                })
        }


        ////////////////////////////
        var vm = this;
        vm.getSiteInfo = getSiteInfo;
        vm.siteInfoInput = true;
    }
})();