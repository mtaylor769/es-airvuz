(function () {
	'use strict';

	angular
		.module('AirvuzAdmin')
		.controller('UsersController', UsersController);

	UsersController.$inject = ['$http', 'confirmDelete', 'unAuthorized', '$state'];

	function UsersController($http, confirmDelete, unAuthorized, $state) {

		function searchUsername(username) {
			$http.get('/api/users', { params: {
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
			console.log(user);
			confirmDelete().then(function(){
				//Do something if the user confirms
				// var index = vm.users.indexOf(user);
				$http.delete('/api/users/' + user._id)
					.then(function(){
						vm.users.splice(index, 1)
					}, function(error) {
						console.log(error);
						if(error.status === 401) {
							unAuthorized()
						}
					})
			}, function(){
				//Do something else if the user cancels
			});
		}

		function changeUserStatus(user, status) {
			confirmDelete()
				.then(function() {
					$http.put('/api/users/' + user._id + '/status', {status: status})
						.then(function() {
						}, function(error) {
							if(error.status === 401) {
								unAuthorized();
							}
						});
				});
		}

		function changeAclRoles() {
			$state.go('users.aclRoles', {userId: vm.user._id});
		}

		///////////////////////
		var vm = this;
		vm.searchUsername = searchUsername;
		vm.removeUser = removeUser;
		vm.searchUserUrl = searchUserUrl;
		vm.changeUserStatus = changeUserStatus;
		vm.changeAclRoles = changeAclRoles;
	}
})();

