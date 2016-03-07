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
      $http.get('/api/v2/reports/site-info', { params: {startDate: startDate, endDate: endDate}})
        .success(function(data){
          var newUsersArray = [];
          data.newUsersList.forEach(function(user){
            user.email = typeof user.email != 'undefined' ? user.email : '';
            user.first_name = typeof user.first_name != 'undefined' ? user.first_name : '';
            user.last_name = typeof  user.last_name != 'undefined' ? user.last_name : '';
            user.user_name = typeof user.user_name != 'undefined' ? user.user_name : '';
            user.urlName = typeof user.urlName != 'undefined' ? user.urlName : '';
            user.joining_date = typeof user.joining_date != 'undefined' ? user.joining_date : '';
            user.country = typeof user.country != 'undefined' ? user.country : '';
            user.fbUsername = typeof user.fbUsername != 'undefined' ? user.fbUsername : '';
            user.instagramUsername = typeof user.instagramUsername != 'undefined' ? user.instagramUsername : '';
            user.TwitterUserName = typeof user.TwitterUserName != 'undefined' ? user.TwitterUserName : '';
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