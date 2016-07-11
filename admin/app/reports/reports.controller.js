(function(){
  'use strict';

  angular
    .module('AirvuzAdmin')
    .controller('reportsController', reportsController);

  reportsController.$inject = ['$scope', '$http'];


  function reportsController($scope, $http) {


    function userVideos(startDate, endDate) {
      $scope.siteInfo = false;
      $scope.videos = false;
      $scope.comments = false;
      $scope.loading = true;
      $http.get('/api/reports/site-info', { params: {startDate: startDate, endDate: endDate}})
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
          $scope.title = data.title;
          $scope.totalUsers = data.totalUsers;
          $scope.totalVideos = data.totalVideos;
          $scope.newUsersCount = data.newUsersCount;
          $scope.newVideos = data.newVideos;
          $scope.startDate = startDate;
          $scope.endDate = endDate;
          $scope.newUsersList = newUsersArray;
          $scope.loading = false;
          $scope.siteInfo = true;
      })
    }

    function getComments(username,startDate, endDate){
      $scope.siteInfo = false;
      $scope.videos = false;
      $scope.comments = false;
      $scope.loading = true;
      $http.get('/api/v2/reports/comments', {params: {username: username, startDate: startDate, endDate: endDate}})
        .success(function(data){
          $scope.username = username;
          $scope.commentCount = data.length;
          $scope.startDate = startDate;
          $scope.endDate = endDate;
          $scope.loading = false;
          $scope.comments = true;

        })
    }

    function getVideos(username,startDate, endDate) {
      $scope.siteInfo = false;
      $scope.videos = false;
      $scope.comments = false;
      $scope.loading = true;
      $http.get('/api/v2/reports/videos', {params: {username: username, startDate: startDate, endDate: endDate}})
        .success(function(data){
          console.log(data);
          $scope.username = username;
          $scope.videoCount = data.length;
          $scope.startDate = startDate;
          $scope.endDate = endDate;
          $scope.loading = false;
          $scope.videos = true;
        })
    }



    //////////////////
    $scope.userVideos = userVideos;
    $scope.getComments = getComments;
    $scope.getVideos = getVideos;
  }
})();