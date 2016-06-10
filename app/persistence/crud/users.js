"use strict";
try {
	var log4js											= require('log4js');
	var logger											= log4js.getLogger('app.persistence.crud.users');

	var Promise											= require('bluebird');
	
	var ErrorMessage								= require('../../utils/errorMessage');
	var socialCrud 									= require('../../persistence/crud/socialMediaAccount');
	var database										= require('../database/database');
	var UserModel										= database.getModelByDotPath({	modelDotPath	: "app.persistence.model.users" });
	var crypto 											= require('crypto');

}
catch(exception) {
	logger.error(" import error:" + exception);
}

var users = function() {};

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
users.prototype.validateCreateUser = function(params) {
	/*
	 * @type {string}
	 */
	logger.debug('made it to validation');
	var sourceLocation				= "persistence.crud.Users.create";
	var userInfo 							= {};
	//need to pass in user data info
	var errorMessage										= new ErrorMessage();
	userInfo.data 											= {};
	userInfo.data.coverPicture					= params.coverPicture || "";
	userInfo.data.emailAddress					= params.emailAddress || null;
	userInfo.data.userNameDisplay				= params.username || null;
	userInfo.data.aclRoles 							= params.aclRoles || ['user-general'];
	userInfo.data.profilePicture				= params.profilePicture || "";
	userInfo.data.isSubscribeAirVuzNews	= params.isSubscribeAirVuzNews || false;

	if (params.social) {
		userInfo.data.status 							= 'active';
	} else {
		userInfo.data.password        		= params.password || null;
		userInfo.data.confirmPassword     = params.confirmPassword || null;
		userInfo.data.status 							= 'email-confirm';

		if(userInfo.data.password === null) {
			userInfo.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "password"
				},
				sourceError			: "#password",
				displayMsg			: "This field is required",
				errorMessage		: "Password is null",
				sourceLocation	: sourceLocation
			});
		}
		if(userInfo.data.confirmPassword === null) {
			userInfo.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "emailAddress"
				},
				sourceError			: "#confirm-password",
				displayMsg			: "This field is required",
				errorMessage		: "Confirm Password is null",
				sourceLocation	: sourceLocation
			});
		}
		if(userInfo.data.password !== null && userInfo.data.confirmPassword !== null && userInfo.data.password !== userInfo.data.confirmPassword) {
			userInfo.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "emailAddress"
				},
				sourceError			: "#password",
				displayMsg			: "Passwords dont match",
				errorMessage		: "Passwords dont match",
				sourceLocation	: sourceLocation
			});
		}
	}
	if(userInfo.data.emailAddress === null) {
		userInfo.errors = errorMessage.getErrorMessage({
			statusCode			: "400",
			errorId					: "VALIDA1000",
			templateParams	: {
				name : "emailAddress"
			},
			sourceError			: "#email",
			displayMsg			: "This field is required",
			errorMessage		: "Email address is null",
			sourceLocation	: sourceLocation
		});
	}
	
	if(userInfo.data.userNameDisplay === null) {
		userInfo.errors = errorMessage.getErrorMessage({
			statusCode			: "400",
			errorId					: "VALIDA1000",
			templateParams	: {
				name : "userNameDisplay"
			},
			sourceError			: "#username",
			displayMsg			: "This field is required",
			errorMessage		: "userNameDisplay is null",
			sourceLocation	: sourceLocation
		});
	}
	return UserModel.findOne({emailAddress: userInfo.data.emailAddress}).exec()
			.then(function(email) {
				if (email) {
					socialCrud.findByUserId(email._id)
						.then(function(social) {
							if(social) {
								userInfo.errors = errorMessage.getErrorMessage({
									statusCode: "400",
									errorId: "VALIDA1000",
									templateParams: {
										name: "emailAddress"
									},
									sourceError: "#email",
									displayMsg: "Email already exists. Please reset password.",
									errorMessage: "Email already exists",
									sourceLocation: sourceLocation
								});
							} else {
								userInfo.errors = errorMessage.getErrorMessage({
									statusCode: "400",
									errorId: "VALIDA1000",
									templateParams: {
										name: "emailAddress"
									},
									sourceError: "#email",
									displayMsg: "Email already exists",
									errorMessage: "Email already exists",
									sourceLocation: sourceLocation
								});
							}
						})	
				} else {
					if(email !== null) {
						email = userInfo.data.emailAddress;
						var regex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}/g;
						var checkEmail = email.match(regex);
						if(!checkEmail) {
							userInfo.errors = errorMessage.getErrorMessage({
								statusCode: "400",
								errorId: "VALIDA1000",
								templateParams: {
									name: "emailAddress"
								},
								sourceError: "#email",
								displayMsg: "Please enter a vaild email address",
								errorMessage: "Invalid Email",
								sourceLocation: sourceLocation
							});
						}	
					} 
				}
				return UserModel.findOne({userNameDisplay: userInfo.data.userNameDisplay}).exec();
			})
			.then(function (userNameDisplay) {
				if (userNameDisplay) {
					userInfo.errors = errorMessage.getErrorMessage({
						statusCode: "400",
						errorId: "VALIDA1000",
						templateParams: {
							name: "userName"
						},
						sourceError: '#username',
						displayMsg: "Username already exists",
						errorMessage: "Username already exists",
						sourceLocation: sourceLocation
					});
				}
				// replace illegal characters
				if (userInfo.data.userNameDisplay) {
					userInfo.data.userNameUrl = UserModel.purgeUserNameDisplay(userInfo.data.userNameDisplay);
				}
				return userInfo;
			});
	
};


var ValidateUserName = function(id, params) {
	var sourceLocation				= "persistence.crud.Users.update";
	var errorMessage					= new ErrorMessage();

	return(new Promise(function(resolve, reject) {
			if (params.userNameDisplay) {
				UserModel.findOne({userNameDisplay : params.userNameDisplay})
					.lean()
					.exec()
						.then(function(user){
						if(user){
							if (user._id !== id) {
								var errors = errorMessage.getErrorMessage({
									statusCode			: "400",
									errorId					: "VALIDA1000",
									templateParams	: {
										name : "userNameDisplay"
									},
									sourceError			: '#username',
									displayMsg			: "Username already exists",
									errorMessage		: "Username already exists",
									sourceLocation	: sourceLocation
								});
								return reject(errors);
							} else {
								return resolve();
							}
						} else {
							return resolve();
						}
					})
					.catch(function(error) {
						return reject(error);
					});
			} else {
				return resolve();
			}
		})
	);
};

var ValidateEmailAddress = function(id, params) {
	var sourceLocation				= "persistence.crud.Users.update";
	var errorMessage					= new ErrorMessage();

	return(new Promise(function(resolve, reject) {
		if (params.emailAddress) {
			UserModel.findOne({emailAddress : params.emailAddress})
			.then(function(user){
				if (user._doc._id !== id) {
					var errors = errorMessage.getErrorMessage({
						statusCode			: "400",
						errorId					: "VALIDA1000",
						templateParams	: {
							name : "emailAddress"
						},
						sourceError			: "#email",
						displayMsg			: "Email already exists",
						errorMessage		: "Email already exists",
						sourceLocation	: sourceLocation
					});
					reject(errors);
					return;
				}
				return resolve();
			})
			.catch(function(error) {
				reject(error);
				return;
			});
		} else {
			resolve();
			return;
		}
		}));
};

var ValidatePassword = function(id, params) {
	var sourceLocation				= "persistence.crud.Users.update";
	var errorMessage					= new ErrorMessage();
	
	return(new Promise(function(resolve, reject) {
		if (params.oldPassword) {
			if (params.newPassword !== params.confirmPassword) {
				var errors = errorMessage.getErrorMessage({
					statusCode			: "400",
					errorId					: "VALIDA1000",
					templateParams	: {
						name : "password"
					},
					sourceError			: "Passwords do not match",
					errorMessage		: "Passwords do not match",
					sourceLocation	: sourceLocation
				});
				reject(errors);
				return;
			} else {
				UserModel.findById(id).exec()
				.then(function (user) {
					if(!user.validPassword(params.oldPassword)) {
						var errors = errorMessage.getErrorMessage({
							statusCode			: "400",
							errorId					: "VALIDA1000",
							templateParams	: {
								name : "password"
							},
							sourceError			: "Password Invalid",
							errorMessage		: "Invalid Password",
							sourceLocation	: sourceLocation
						});
						reject(errors);
						return;
					} else {
						resolve();
						return;
					}
				})
				.catch(function(error){
					reject(error);
				});
			}
		} else {
			resolve();
			return;
		}
		}));
};

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
users.prototype.validateUpdateUser = function(id, params) {
	var userInfo 							= {};

	return(new Promise(function(resolve, reject) {
		
		ValidateUserName(id, params)
		.then(function(validation) {
			userInfo.errors = validation;
			
			ValidateEmailAddress(id, params)
			.then(function(validation){
				userInfo.errors = validation;
				
				ValidatePassword(id, params)
				.then(function(validation){
					userInfo.errors = validation;
					resolve(userInfo);
					return;
				})
				.catch(function(error){
					reject(error);
					return;
				});
			})
			.catch(function(error){
				reject(error);
				return;
			});
		})
		.catch(function(error){
			reject(error);
			return;
		});
	}));
};

/*
 * Create a new Users document.
 */
users.prototype.create = function(params) {
	logger.debug('made it into user create');
	var validation 				= this.validateCreateUser(params);
	return validation.then(function (userInfo) {
		if(userInfo.errors) {
			console.log(userInfo.errors);
			throw userInfo.errors;
		} else {
			// Persist
			var saveUser = new UserModel(userInfo.data);
			if (params.social) {
				saveUser.userNameDisplay = saveUser._id;
				saveUser.userNameUrl = saveUser._id;
			}
			if (saveUser.password) {
				logger.debug('hash password');
				saveUser.password = UserModel.generateHash(saveUser.password);
			}
			return saveUser.save(function (error) {
				if (error) {
					logger.debug('error while saving ' + error);
					var errorMessage = new ErrorMessage();
					throw errorMessage.getErrorMessage({
						statusCode: "500",
						errorId: "PERS1000",
						errorMessage: "Failed while creating new user",
						sourceError: error,
						sourceLocation: "persistence.crud.Users.create"
					});
				}
			});
		}
	});
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
			UserModel.findOne({_id : validation.userId})
				.select('aclRoles emailAddress userNameDisplay userNameUrl lastName firstName profilePicture autoPlay')
				.lean()
				.then(function (user) {
					if(user.profilePicture.indexOf('http') > -1){
						user.externalLink = true;
					} else if(user.profilePicture === '') {
						return socialCrud.findByUserIdAndProvider(user._id, 'facebook')
							.then(function (social) {
								if(social) {
									user.externalLink = true;
									user.profilePicture = 'http://graph.facebook.com/' + social.accountId + '/picture?type=large';
								}
								return user;
							});
					}
					return user;
				})
				.then(function(user) {
					resolve(user)
				})
				.catch(function (error) {
					var errorMessage		= new ErrorMessage();
					errorMessage.getErrorMessage({
						statusCode			: "500",
						errorId 				: "PERS1000",
						errorMessage 		: "Failed while getting user by Id",
					  sourceError			:  error,
						sourceLocation	: "persistence.crud.Users.getAllAusers"
					});
					reject(errorMessage.getErrors());
				})
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

/**
 * get a user by email
 * @param email
 * @returns {Promise}
 */
users.prototype.getUserByEmail = function (email) {
	if (!email) {
		return Promise.reject('Required email input - getUserByEmail');
	}
	return UserModel.findOne({emailAddress : email.toLowerCase()}).exec();
};

/*
* Update user information
*/
users.prototype.update = function (id, params) {
	var currentTransaction = this;
	return(new Promise(function(resolve, reject){

		var validate = currentTransaction.validateUpdateUser(id, params);
		validate.then(function(validation) {
			if(validation.errors) {
				reject(validation.errors);
				return;
			} else {
				if (params.userNameDisplay) {
					// update the userNameUrl also
					params.userNameUrl = UserModel.purgeUserNameDisplay(params.userNameDisplay);
				}
				if (params.oldPassword) {
					var hashUser 			= new UserModel();
					var pw 						= UserModel.generateHash(params.newPassword);
					delete params.oldPassword;
					delete params.newPassword;
					delete params.confirmPassword;
					params.password 	= pw;
				}
				UserModel.findByIdAndUpdate(id, params, {new: true}).populate('SocialMediaLinks').exec()
				.then(function(user) {
					if (user._doc.password) {
						user._doc.password = null;
					}
					resolve(user);
					return;
				});
			}
		})
		.catch(function(error){
			reject(error);
			return;
		});
	}));
};

/*
* Delete
*/
users.prototype.delete = function(userId) {
	var validation = {};
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

users.prototype.emailConfirm = function(userId) {
	return(new Promise(function(resolve, reject) {
		UserModel.findOne({_id: userId})
			.then(function(user) {
				if(user.status === 'email-confirm') {
					user.status = 'active';
					user.save(function(user) {
						resolve('true');
					})
				} else {
					resolve('false');
				}
			})
			.catch(function(error) {
				if(!userId){
					resolve()	
				} else if(userId) {
					resolve('false');
				}
			})
	})
	)
};

function updateRoles(params) {
	// TODO: implement
}

function resetPasswordRequest(email) {
	return UserModel.findOne({emailAddress: email}).exec()
		.then(function (user) {
			if (!user) {
				throw 'Email does not exists';
			}

			// random string in hex to prevent adding "/" "+"
			user.resetPasswordCode = crypto.randomBytes(10).toString('hex');

			return user.save();
		});
}

function resetPasswordChange(code, newPassword) {
	return UserModel.findOne({resetPasswordCode: code}).exec()
		.then(function (user) {
			if (!user) {
				throw 'No reset code exists';
			}
			user.password = UserModel.generateHash(newPassword);

			user.resetPasswordCode = undefined;
			return user.save();
		});
}

/**
 * get user by user name url / user name display
 * @param userNameUrl
 * @returns {Promise}
 */
function getUserByUserNameUrl(userNameUrl) {
	var validation = {};

	if (userNameUrl) {
		validation.userNameUrl 	= UserModel.purgeUserNameDisplay(userNameUrl);
	} else {
		validation.userNameUrl		= null;
		var errorMessage						= new ErrorMessage();
		errorMessage.getErrorMessage({
			statusCode								: "500",
			errorId 									: "PERS1000",
			errorMessage 							: "Failed while getting user by userNameUrl",
			sourceError								: "Invalid userNameUrl",
			sourceLocation						: "persistence.crud.Users.getUserByUserNameUrl"
		});
		validation.errors 					= errorMessage;
		return Promise.reject(validation.errors);
	}

	return UserModel.findOne(validation)
		.select('-password')
		.lean()
		.exec();
}

users.prototype.updateRoles 							= updateRoles;
users.prototype.resetPasswordRequest 			= resetPasswordRequest;
users.prototype.resetPasswordChange 			= resetPasswordChange;
users.prototype.getUserByUserNameUrl 			= getUserByUserNameUrl;

module.exports = new users();
