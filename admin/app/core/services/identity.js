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
				canAccessAdmin: function () {
					var canAccess = false;

					if (this.currentUser && (this.currentUser.aclRoles.indexOf('root') > -1 || this.currentUser.aclRoles.indexOf('user-admin') > -1)) {
						canAccess = true;
					}

					return canAccess;
				}
			};
		}]);

})();