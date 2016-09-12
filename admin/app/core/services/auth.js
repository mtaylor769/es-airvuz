(function () {
	'use strict';

	/**
	 * Auth:
	 * Authenticate user
	 */
	angular
		.module('AirvuzAdmin')
		.factory('auth', ['$http', 'identity', '$q', 'jwtHelper', function ($http, identity, $q, jwtHelper) {
			return {
				/**
				 * Authenticate user
				 * @param email
				 * @param password
				 * @returns login user
				 *
				 */
				login: function (user) {
					var dfd = $q.defer();
					$http.post('/api/auth', user).then(function (response) {
						var token = response.data;
						identity.currentUser = jwtHelper.decodeToken(token);

						if (!identity.canAccessAdmin()) {
							return dfd.reject({error: "You aren't a pro drone pilot"});
						}

						localStorage.setItem('id_token', token);
						dfd.resolve();
					}, function (err) {
						dfd.reject(err.data);
					});
					return dfd.promise;
				},
				logout: function () {
					identity.currentUser = null;
					localStorage.removeItem('id_token');
				}
			};
		}]);
})();