(function () {
	'use strict';

	angular
		.module('AirvuzAdmin')
		.controller('UsersController', UsersController);

	UsersController.$inject = ['$scope', '$http', 'confirmDelete'];

	function UsersController($scope, $http, confirmDelete) {

		function searchUsername(username) {
			$http.get('/api/v2/users/searchUsers', { params: {
				username: username
			}}).then(function(response){
				console.log(response);
				$scope.users = response.data.users;
				$scope.username = '';
			})
		}

		function searchUserUrl(url) {
			$http.get('/api/v2/users/searchUserUrl', { params: {
				url: url
			}}).then(function(response){
				$scope.users = response.data.user;
				$scope.userId = '';
			})
		}

		function removeUser(user){
			confirmDelete().then(function(){
				//Do something if the user confirms
				var index = $scope.users.indexOf(user);
				$http.post('/api/v2/users/removeUser', {id: user._id})
					.then(function(){
						$scope.users.splice(index, 1)
					})
			}, function(){
				//Do something else if the user cancels
			});
		}

		///////////////////////
		$scope.searchUsername = searchUsername;
		$scope.removeUser = removeUser;
		$scope.searchUserUrl = searchUserUrl;
	}
})();

