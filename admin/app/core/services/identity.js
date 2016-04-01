(function () {
	'use strict';
	/**
	 * identity:
	 * User identity
	 */
	angular
		.module('AirvuzAdmin')
		.factory('identity', ['jwtHelper', function (jwtHelper) {
			var currentUser,
				token = localStorage.getItem('id_token');

			// if token is not expire decode the token or else set current user to null
			if (token) {
				currentUser = !jwtHelper.isTokenExpired(token) ? jwtHelper.decodeToken(token) : null;
			}

			return {
				/**
				 * hold the current login user info
				 */
				currentUser: currentUser,
				/**
				 * check to see if there is a user
				 */
				isAuthenticated: function () {
					return !!this.currentUser;
				},
				hasRole: function (role) {
					return this.currentUser && this.currentUser.aclRoles.indexOf(role) > -1;
				},
				canAccessAdmin: function () {
					var canAccess = false;

					if (this.hasRole('root') || this.hasRole('user-admin') || this.hasRole('user-root')) {
						canAccess = true;
					}

					return canAccess;
				}
			};
		}]);

})();