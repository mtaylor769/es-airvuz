"use strict";

var Promise											= require('bluebird');
var mongoose										= require('mongoose');
var log4js											= require('log4js');
var logger											= log4js.getLogger('persistance.crud.Users');
var ErrorMessage								= require('../../utils/errorMessage');
var ObjectValidationUtil				= require('../../utils/objectValidationUtil');
var UserModel										= require('../model/users');

var users = function() {
	
}

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
	var errorMessage							= new ErrorMessage();
	userInfo.data 								= {};
	userInfo.data.emailAddress		= params.emailAddress || null;
	userInfo.data.firstName				= params.firstName || null;
	userInfo.data.lastName				= params.lastName || null;
	userInfo.data.userName				= params.userName || null;		

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

		if(userInfo.data.firstName === null) {
			userInfo.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "firstName"
				},
				errorMessage		: "First name is null",
				sourceLocation	: sourceLocation
			});
		}

		if(userInfo.data.lastName === null) {
			userInfo.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "lastName"
				},
				errorMessage		: "Last name is null",
				sourceLocation	: sourceLocation
			});
		}

		return userInfo;
}


/*
 * Create a new Users document.
 */
users.prototype.create = function(params) {
	console.log('params');
	console.log(params);
	var validation 				= this.validateCreateUser(params);
	return(new Promise(function(resolve, reject) {

			if(validation.errors) {
				console.log('validation errors found');
				console.log(validation.errors);
				reject(validation.errors);
        return;
			}
				// Persist
				var saveUser 						= new UserModel(validation.data);
				if (saveUser.password) {
					saveUser.password 		= saveUser.generateHash(saveUser.password);
				}
				console.log('preSave');
				console.log('save user : ' + saveUser);
				saveUser.save(function(error, theUser){
					console.log('postSave');
					if (error) {
						console.log('error while saving');
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
						console.log('saving user');
						console.log(theUser);
						resolve(theUser);
            return;
				});
		}));
}

/*
* Get all users
*/
users.prototype.getAllUsers = function() {
	return(new Promise(function(resolve, reject){
		UsersModel.find({}).exec()
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

	
}

/*
* Get a user by ID
*/
users.prototype.getUserById = function (userId) {
	console.log('searching for user by userId: ' + userId);
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
			UserModel.find({_id : validation.userId},
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
					resolve(user);
				}
			});
		}
	}));
}

/*
* Get a user by social media ID
*/
users.prototype.getUserBySocialId = function (socialId) {
	console.log('searching for user by socialId: ' + socialId);
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
			console.log('validation errors exist');
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
					console.log('here is your user');
					console.log(user);
					resolve(user);
				}
			});
		}

	}));
}

/*
* Get a user by email
*/
users.prototype.getUserByEmail = function (userEmail) {
	var validation = {};
	if (userEmail) {
		validation.userEmail 	= userEmail;
	} else {
		validation.userEmail		= null;
		var errorMessage						= new ErrorMessage();
		errorMessage.getErrorMessage({
			statusCode								: "500",
			errorMessage 							: "Failed while getting user by Email",
			sourceError								: "Invalid UserEmail",
			sourceLocation						: "persistence.crud.Users.getUserByEmail"
		});

		validation.errors 					= errorMessage;
	}

	return(new Promise(function(resolve, reject) {
		if (validation.userEmail === null) {
			reject(validation.errors);
		} else {
			UserModel.findOne({emailAddress : validation.userEmail}, function(error, user){
				if (error) {
					var errorMessage		= new ErrorMessage();
					errorMessage.getErrorMessage({
						statusCode			: "500",
						errorMessage 		: "Failed while getting user by Email",
						sourceError			: error,
						sourceLocation	: "persistence.crud.Users.getUserByEmail"
					});
					reject(errorMessage.getErrors());
				} else {
					resolve(user);
				}
			});
		}
	}));
	
}


/*
* Get a user by user name
*/
users.prototype.getUserByUserName = function (userName) {
	console.log('hitting getUserByUserName');
	console.log(userName);
	var validation = {};
	if (userName) {
		validation.userName 	= userName.username;
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
			var userFound = UserModel.find({userName : validation.userName}, function(error, user){
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
}

/*
* Update user information
*/
users.prototype.update = function (params) {
	var preCondition = this.getPreCondition({ sourceLocation : "persistence.crud.Users.getUserByUserName"});
	var validation = preCondition.validate(params);
	//build validation for params

	return(new Promise(function(resolve, reject){
		if (validation.errors !== null) {
			reject(validation.errors);
		} else {
			//Code to update user
		}

	}));
}

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
}

module.exports = new users();
