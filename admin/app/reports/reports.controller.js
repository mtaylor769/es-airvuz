(function(){
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('reportsController', reportsController);

  reportsController.$inject = ['$http'];


  function reportsController($http) {


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

    function getComments(username,startDate, endDate){
        vm.siteInfo = false;
        vm.videos = false;
        vm.comments = false;
        vm.loading = true;
      $http.get('/api/reports/comments', {params: {username: username, startDate: startDate, endDate: endDate}})
        .success(function(data){
            vm.commentsUsername = username;
            vm.commentsCommentCount = data.commentCount;
            vm.commentsStartDate = startDate;
            vm.commentsEndDate = endDate;
            vm.loading = false;
            vm.comments = true;

        })
    }

    function getVideos(username,startDate, endDate) {
        vm.siteInfo = false;
        vm.videos = false;
        vm.comments = false;
        vm.loading = true;
      $http.get('/api/reports/videos', {params: {username: username, startDate: startDate, endDate: endDate}})
        .success(function(data){
            vm.videosUsername = username;
            vm.videoCount = data.length;
            vm.videosStartDate = startDate;
            vm.videosEndDate = endDate;
            vm.loading = false;
            vm.videos = true;
        })
    }

    function getEmployeeReport(startDate, endDate) {
        vm.siteInfo = false;
        vm.videos = false;
        vm.comments = false;
        vm.loading = true;
        vm.employeeReport = false;
        var dateObject = {};
        dateObject.startDate = startDate;
        dateObject.endDate = endDate;
        $http.post('/api/reports/employee-contributor', dateObject)
            .success(function(data) {
                vm.employees = data;
                vm.employeeReport = true;
                vm.loading = false;
            })
    }

    function openInput(input) {
        vm.siteInfoInput = false;
        vm.siteInfo = false;
        vm.videosInput = false;
        vm.videos = false;
        vm.commentsInput = false;
        vm.comments = false;
        vm.employeeReportInput = false;
        vm.employeeReport = false;
        vm.hashtagVideoReportInput = false;
        vm.hashtagVideoReport = false;
        vm.hashtagUserReportInput = false;
        vm.hashtagUserReport = false;

        switch (input) {
            case 'siteInfo':
                vm.siteInfoInput = true;
                break;
            case 'videos':
                vm.videosInput = true;
                break;
            case 'comments':
                vm.commentsInput = true;
                break;
            case 'employeeReport':
                vm.employeeReportInput = true;
                break;
            case 'hashtagVideoReport':
                vm.hashtagVideoReportInput = true;
                break;
            case 'hashtagUserReport':
                vm.hashtagUserReportInput = true;
            default:
                break;
        }
    }

    function getVideoHashcodes(startDate, endDate, hashtag) {
        var data = {};
        data.startDate = startDate;
        data.endDate = endDate;
        data.hashTag = hashtag;
        $http.post('/api/reports/hashtag', data)
            .success(function(data) {
                if(data.length > 20) {
                    var topVideos = data.splice(0, 20);
                } else {
                    var topVideos = data;
                }
                vm.hashtagVideoReport = true;
                vm.hashtagVideoDisplay = topVideos;
            })
    }

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



      //////////////////
    var vm = this;
    vm.getSiteInfo = getSiteInfo;
    vm.getComments = getComments;
    vm.getVideos = getVideos;
    vm.getEmployeeReport = getEmployeeReport;
    vm.openInput = openInput;
    vm.getVideoHashcodes = getVideoHashcodes;
    vm.getUserHashCodes = getUserHashCodes;
  }
})();