"use strict";
try {
	var log4js											= require('log4js');
	var logger											= log4js.getLogger('app.persistance.crud.Users');

	var Promise											= require('bluebird');
	
	var ErrorMessage								= require('../../utils/errorMessage');
	var ObjectValidationUtil				= require('../../utils/objectValidationUtil');

	var database										= require('../database/database');
	var currentUser									= null;
	var UserModel										= database.getModelByDotPath({	modelDotPath	: "app.persistence.model.users" });
	var validation 									= {};

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
	userInfo.data.coverPicture					= params.coverPicture || "";
	userInfo.data.emailAddress					= params.emailAddress || null;
	userInfo.data.userName							= params.userName || null;
	userInfo.data.aclRoles 							= params.aclRoles || ['user-general'];
	userInfo.data.profilePicture				= params.profilePicture || "";
	

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
			sourceError			: null,
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
			sourceError			: null,
			errorMessage		: "Username is null",
			sourceLocation	: sourceLocation
		});
	}

	return userInfo;
};


var ValidateUserName = function(id, params) {
	return(new Promise(function(resolve, reject) {
			
			UserModel.findOne({userName : params.userName})
			.then(function(user){
				if (user._doc._id !== id) {
					var errors = errorMessage.getErrorMessage({
						statusCode			: "400",
						errorId					: "VALIDA1000",
						templateParams	: {
							name : "userName"
						},
						sourceError			: null,
						errorMessage		: "Username already exists",
						sourceLocation	: sourceLocation
					});
					reject(errors);
				}
				resolve();
			})
			.catch(function(error) {
				reject(error);
			});
		
		})
	);
}

var ValidateEmailAddress = function(id, params) {
	return(new Promise(function(resolve, reject) {
			
			UserModel.findOne({userName : params.userName})
			.then(function(user){
				if (user._doc._id !== id) {
					var errors = errorMessage.getErrorMessage({
						statusCode			: "400",
						errorId					: "VALIDA1000",
						templateParams	: {
							name : "userName"
						},
						sourceError			: null,
						errorMessage		: "Username already exists",
						sourceLocation	: sourceLocation
					});
					reject(errors);
					return;
				}
				resolve();
				return;
			})
			.catch(function(error) {
				reject(error);
				return;
			});
		
		})
	);
}

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
users.prototype.validateUpdateUser = function(id, params) {
	var sourceLocation				= "persistence.crud.Users.update";
	var userInfo 							= {};
	var errorMessage					= new ErrorMessage();

	return(new Promise(function(resolve, reject) {
		
		/*
		ValidateUserName(id, params)
			.then(function() {
				ValidateEmailAddress(id, params).then(function() {
					
				})
				return ...
			})
		
		
		*/

		
		
		
		
		if(params.userName) {
			UserModel.findOne({userName : params.userName})
			.then(function(user){
				if (user._doc._id !== id) {
					userInfo.errors = errorMessage.getErrorMessage({
						statusCode			: "400",
						errorId					: "VALIDA1000",
						templateParams	: {
							name : "userName"
						},
						sourceError			: null,
						errorMessage		: "Username already exists",
						sourceLocation	: sourceLocation
					});
				}
			});
		}

		if(params.emailAddress) {
			UserModel.findOne({emailAddress : params.emailAddress})
			.then(function(user){
				//TODO make sure this works
				if (user._doc._id !== id) {
					userInfo.errors = errorMessage.getErrorMessage({
						statusCode			: "400",
						errorId					: "VALIDA1000",
						templateParams	: {
							name : "emailAddress"
						},
						sourceError			: null,
						errorMessage		: "Email already exists",
						sourceLocation	: sourceLocation
					});
				} else {
					logger.debug('nope');
				}
			});
		}

		if(params.oldPassword) {
			UserModel.findById(id).exec()
			.then(function (user) {
				if(!user.validPassword(params.oldPassword)) {
					userInfo.errors = errorMessage.getErrorMessage({
						statusCode			: "400",
						errorId					: "VALIDA1000",
						templateParams	: {
							name : "password"
						},
						sourceError			: "Password Invalid",
						errorMessage		: "Invalid Password",
						sourceLocation	: sourceLocation
					});
				}
			});	
		}
		if (params.newPassword !== params.confirmPassword) {
			userInfo.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "password"
				},
				sourceError			: "Passwords do not match",
				errorMessage		: "Passwords do not match",
				sourceLocation	: sourceLocation
			});
		}

		return userInfo;

	}));
	
};

/*
 * Create a new Users document.
 */
users.prototype.create = function(params) {
	validation 				= this.validateCreateUser(params);
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
			UserModel.findOne({_id : validation.userId}, 'aclRoles emailAddress userName lastName firstName profilePicture autoPlay',
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
			UserModel.findOne({userName : validation.userName}, '-password', function(error, user) {
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
users.prototype.update = function (id, params) {
	var currentTransaction = this;
	return(new Promise(function(resolve, reject){

		var validate = currentTransaction.validateUpdateUser(id, params);
		validate.then(function(validation){
			if(validation.errors) {
				reject(validation.errors);
				return;
			} else {
				if (params.oldPassword) {
					var hashUser 			= new UserModel();
					var pw 						= hashUser.generateHash(params.newPassword);
					delete params.oldPassword;
					delete params.newPassword;
					delete params.confirmPassword;
					params.password 	= pw;
				}
				UserModel.findByIdAndUpdate(id, params, {new: true}).exec()
				.then(function(user) {
					if (user._doc.password) {
						user._doc.password = null;
					}
					//resolve(user);
					resolve(null);
					return;
				});
			}
		});
		
		

	}));
};

/*
* Delete
*/
users.prototype.delete = function(userId) {
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
