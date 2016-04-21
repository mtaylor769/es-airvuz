"use strict";
try {
	var log4js											= require('log4js');
	var logger											= log4js.getLogger('app.persistance.crud.Users');

	var Promise											= require('bluebird');
	
	var ErrorMessage								= require('../../utils/errorMessage');
	var ObjectValidationUtil				= require('../../utils/objectValidationUtil');

	var database										= require('../database/database');
	var UserModel										= database.getModelByDotPath({	modelDotPath	: "app.persistence.model.users" });

} 
catch(exception) {
	logger.error(" import error:" + exception);
}

var users = function() {
	
};

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
users.prototype.validateCreateUser = function(params) {
	/*
	 * @type {string}
	 */
	var sourceLocation				= "persistence.crud.Users.create";
	var userInfo 							= {};
	
	//need to pass in user data info
	var errorMessage										= new ErrorMessage();
	userInfo.data 											= {};
	userInfo.data.emailAddress					= params.emailAddress || null;
	userInfo.data.userName							= params.userName || null;
	userInfo.data.aclRoles 							= params.aclRoles || ['user-general'];

	if (params.socialMediaAccounts) {
		userInfo.data.socialMediaAccounts 	= params.socialMediaAccounts;
	} else {
		userInfo.data.password        		= params.password || null;
	}

	if(userInfo.data.emailAddress === null) {
		userInfo.errors = errorMessage.getErrorMessage({
			statusCode			: "400",
			errorId					: "VALIDA1000",
			templateParams	: {
				name : "emailAddress"
			},
			errorMessage		: "Email address is null",
			sourceLocation	: sourceLocation
		});
	}

	if(userInfo.data.userName === null) {
		userInfo.errors = errorMessage.getErrorMessage({
			statusCode			: "400",
			errorId					: "VALIDA1000",
			templateParams	: {
				name : "userName"
			},
			errorMessage		: "Username is null",
			sourceLocation	: sourceLocation
		});
	}

	return userInfo;
};


/*
 * Create a new Users document.
 */
users.prototype.create = function(params) {
	var validation 				= this.validateCreateUser(params);
	return(new Promise(function(resolve, reject) {

			if(validation.errors) {
				logger.debug('validation errors found');
				logger.debug(validation.errors);
				reject(validation.errors);
        return;
			}
				// Persist
				var saveUser 						= new UserModel(validation.data);
				if (saveUser.password) {
          logger.debug('hash password');
					saveUser.password 		= saveUser.generateHash(saveUser.password);
				}
				saveUser.save(function(error) {
					if (error) {
						logger.debug('error while saving ' + error);
						var errorMessage		= new ErrorMessage();
						errorMessage.getErrorMessage({
							statusCode			: "500",
							errorId 				: "PERS1000",
							errorMessage 		: "Failed while creating new user",
							sourceError			: error,
							sourceLocation	: "persistence.crud.Users.create"
						});
						reject(errorMessage.getErrors());
            return;
					}
						//logger.debug('saving user');
						//logger.debug(saveUser);
						resolve(saveUser);
            return;
				});
		}));
};

/*
* Get all users
*/
users.prototype.getAllUsers = function() {
	return(new Promise(function(resolve, reject){
		UserModel.find({}).exec()
		.then(function(allUsers){
			var param = {
				status 	: "200",
				message : "Okay",
				users 	: allUsers
			};
			resolve(param);
		})
		.error(function(e) {
			var errorMessage		= new ErrorMessage();
			errorMessage.getErrorMessage({
				statusCode			: "500",
				errorId 				: "PERS1000",
				errorMessage 		: "Failed while getting users",
				sourceError			: e,
				sourceLocation	: "persistence.crud.Users.getAllAusers"
			});
			reject(errorMessage.getErrors());
		});
	}));

	
};

/*
* Get a user by ID
*/
users.prototype.getUserById = function (userId) {
	logger.debug('searching for user by userId: ' + userId);
	var validation = {};

	if (userId) {
		validation.userId 			= userId;
	} else {
		validation.userId 			= null;

		var errorMessage		= new ErrorMessage();
		errorMessage.getErrorMessage({
			statusCode								: "500",
			errorId 									: "PERS1000",
			errorMessage 							: "Failed while getting user by Id",
			sourceError								: "Invalid UserId",
			sourceLocation						: "persistence.crud.Users.getUserById"
		});
		validation.errors 					= errorMessage;
	}

	return(new Promise(function(resolve, reject){
		if (validation.userId === null) {
			reject(validation.errors);
		} else {
			UserModel.findOne({_id : validation.userId}, 'aclRoles emailAddress userName lastName firstName profilePicture',
				function(error, user){
				if (error) {
					var errorMessage		= new ErrorMessage();
					errorMessage.getErrorMessage({
						statusCode			: "500",
						errorId 				: "PERS1000",
						errorMessage 		: "Failed while getting user by Id",
						sourceError			: error,
						sourceLocation	: "persistence.crud.Users.getAllAusers"
					});
					reject(errorMessage.getErrors());
				} else {
					logger.debug('user resolved');
					resolve(user);
				}
			});
		}
	}));
};

/*
* Get a user by social media ID
*/
users.prototype.getUserBySocialId = function (socialId) {
	logger.debug('searching for user by socialId: ' + socialId);
	var validation = {};

	if (socialId) {
		validation.socialId 			= socialId;
	} else {
		validation.socialId 			= null;

		var errorMessage					= new ErrorMessage();
		errorMessage.getErrorMessage({
			statusCode								: "500",
			errorId 									: "PERS1000",
			errorMessage 							: "Failed while getting user by Id",
			sourceError								: "Invalid socialId",
			sourceLocation						: "persistence.crud.Users.getUserBySocialId"
		});
		validation.errors 					= errorMessage;
	}

	return(new Promise(function(resolve, reject){
		if (validation.errors) {
			logger.debug('validation errors exist');
			reject(validation.errors);
		} else {
			UserModel.find({socialMediaAccounts : validation.socialId}, 
			function(error, user){
				if (error) {
					var errorMessage		= new ErrorMessage();
					errorMessage.getErrorMessage({
						statusCode			: "500",
						errorId 				: "PERS1000",
						errorMessage 		: "Failed while getting user by social Id",
						sourceError			: error,
						sourceLocation	: "persistence.crud.Users.getUserBySocialId"
					});
					reject(errorMessage.getErrors());
				} else {
					logger.debug('here is your user');
					logger.debug(user);
					resolve(user);
				}
			});
		}

	}));
};

/*
* Get a user by email
*/
users.prototype.getUserByEmail = function (email) {
	var validation = {};
	logger.debug('getUserByEmail: '+ email);
	if (email) {
		logger.debug(email);
		validation.emailAddress 	= email;
	} else {
		validation.emailAddress		= null;
		var errorMessage						= new ErrorMessage();
		errorMessage.getErrorMessage({
			statusCode								: "500",
			errorId 									: "PERS1000",
			errorMessage 							: "Failed while getting user by Email",
			sourceError								: "Invalid UserEmail",
			sourceLocation						: "persistence.crud.Users.getUserByEmail"
		});

		validation.errors 					= errorMessage;
	}

	return(new Promise(function(resolve, reject) {
		if (validation.errors) {
			logger.debug(validation.errors);
			reject(validation.errors);
		} else {
			logger.debug('searching user model for address');
			UserModel.findOne({emailAddress : validation.emailAddress}, function(error, user){
				if (error) {
					logger.debug('error when trying to find user by email');
					var errorMessage		= new ErrorMessage();
					errorMessage.getErrorMessage({
						statusCode			: "500",
						errorId 				: "PERS1000",
						errorMessage 		: "Failed while getting user by Email",
						sourceError			: error,
						sourceLocation	: "persistence.crud.Users.getUserByEmail"
					});
					logger.debug(error);
					reject(errorMessage.getErrors());
				} else {
					logger.debug('found user by email');
					logger.debug(user);
					resolve(user);
				}
			});
		}
	}));
	
};


/*
* Get a user by user name
*/
users.prototype.getUserByUserName = function (userName) {
	logger.debug('hitting getUserByUserName');
	logger.debug(userName);
	var validation = {};
	if (userName) {
		validation.userName 	= userName;
	} else {
		validation.userName		= null;
		var errorMessage						= new ErrorMessage();
		errorMessage.getErrorMessage({
			statusCode								: "500",
			errorId 									: "PERS1000",
			errorMessage 							: "Failed while getting user by UserName",
			sourceError								: "Invalid UserName",
			sourceLocation						: "persistence.crud.Users.getUserByUserName"
		});

		validation.errors 					= errorMessage;
	}

	return(new Promise(function(resolve, reject){
		if (validation.userName === null) {
			reject(validation.errors);
		} else {
			UserModel.findOne({userName : validation.userName}, 'aclRoles emailAddress userName firstName lastName', function(error, user) {
				if (error) {
					var errorMessage		= new ErrorMessage();
				errorMessage.getErrorMessage({
					statusCode			: "500",
					errorMessage		: "Failed while getting user by user name",
					sourceError			: error,
					sourceLocation	: "persistence.crud.Users.getUserByUserName"
				});
				reject(errorMessage.getErrors());
				} else {
					resolve(user);
				}
			});
		}
	}));
};

/*
* Update user information
*/
users.prototype.update = function (params) {
	var validation = null; // preCondition.validate(params);

	return(new Promise(function(resolve, reject){
		if (validation.errors) {
			reject(validation.errors);
		} else {
			//Code to update user
		}

	}));
};

/*
* Delete
*/
users.prototype.delete = function(userId) {
	var validation 								= {};
	if (userId) {
		validation.userId 					= userId;
	} else {
		validation.userId						= null;
		var errorMessage						= new ErrorMessage();
		errorMessage.getErrorMessage({
			statusCode								: "500",
			errorId 									: "PERS1000",
			errorMessage 							: "Failed while deleting user by Id",
			sourceError								: "Invalid Id",
			sourceLocation						: "persistence.crud.Users.delete"
		});

		validation.errors 					= errorMessage;
	}

	return(new Promise(function(resolve, reject){
		if (validation.userId === null) {
			reject(validation.errors);
		} else {
			UserModel.delete({_id : validation.userId}, function(error, user){
				if (error) {
					var errorMessage		= new ErrorMessage();
					errorMessage.getErrorMessage({
						statusCode			: "500",
						errorMessage 		: "Failed while deleting user by Id",
						sourceError			: error,
						sourceLocation	: "persistence.crud.Users.delete"
					});
					reject(errorMessage.getErrors());
				} else {
					resolve(user);
				}
			});
		}
	}));
};

function updateRoles(params) {
	// TODO: implement
}

users.prototype.updateRoles = updateRoles;

module.exports = new users();
