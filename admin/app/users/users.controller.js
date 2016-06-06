(function () {
	'use strict';

	angular
		.module('AirvuzAdmin')
		.controller('UsersController', UsersController);

	UsersController.$inject = ['$http', 'confirmDelete'];

	function UsersController($http, confirmDelete) {

		function searchUsername(username) {
			$http.get('/api/users/search', { params: {
				username: username
			}}).then(function(response){
				vm.user = response.data;
			}).catch(function (response) {
				if (response.status === 403) {
					alert('You do not have permission to search user. Please contact a master drone pilot');
				}
			});
		}

		function searchUserUrl(url) {
			$http.get('/api/v2/users/searchUserUrl', { params: {
				url: url
			}}).then(function(response){
				vm.users = response.data.user;
				vm.userId = '';
			})
		}

		function removeUser(user){
			confirmDelete().then(function(){
				//Do something if the user confirms
				var index = vm.users.indexOf(user);
				$http.post('/api/v2/users/removeUser', {id: user._id})
					.then(function(){
						vm.users.splice(index, 1)
					})
			}, function(){
				//Do something else if the user cancels
			});
		}

		///////////////////////
		var vm = this;
		vm.searchUsername = searchUsername;
		vm.removeUser = removeUser;
		vm.searchUserUrl = searchUserUrl;
	}
})();

