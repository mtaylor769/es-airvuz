"use strict";

var Promise											= require('bluebird');
var mongoose										= require('mongoose');
var log4js											= require('log4js');
var logger											= log4js.getLogger('persistance.crud.Users');
var ErrorMessage								= require('../../utils/errorMessage');
var ObjectValidationUtil				= require('../../utils/objectValidationUtil');
var UserModel										= require('../model/users');

var Users = function() {
	
}

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
Users.prototype.getPreCondition = function(params) {
	/*
	 * @type {string}
	 */
	var sourceLocation	= params.sourceLocation;
	
	/*
	 * @type {Object}
	 */
	var preCondition		= new ObjectValidationUtil();
	
	preCondition.setValidation(function(params) {
		//need to pass in user data info
		var errorMessage					= new ErrorMessage();
		var sessionId							= params.sessionId || null;
		var userId								= params.userId || null;
		this.data.emailAddress		= params.emailAddress || null;
		this.data.password				= params.password || null;
		this.data.firstName				= params.firstName || null;
		this.data.lastName				= params.lastName || null;
		this.data.userName				= params.userName || null;
		
		if(userId === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorMessage		: "User ID is null", 
				sourceLocation	: sourceLocation
			});
		}			
		
		if(sessionId === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorMessage		: "Session ID is null",
				sourceLocation	: sourceLocation
			});
		}

		if(emailAddress === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorMessage		: "Email address is null",
				sourceLocation	: sourceLocation
			});
		}

		if(password === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorMessage		: "Password is null",
				sourceLocation	: sourceLocation
			});
		}

		if(userName === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorMessage		: "Username is null",
				sourceLocation	: sourceLocation
			});
		}

		if(firstName === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorMessage		: "First name is null",
				sourceLocation	: sourceLocation
			});
		}

		if(lastName === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorMessage		: "Last name is null",
				sourceLocation	: sourceLocation
			});
		}
				
	});

	return(preCondition);
}


/*
 * Create a new Users document.
 */
Users.prototype.create = function(params) {
	console.log("params are: " + params);
	var preCondition = this.getPreCondition({ sourceLocation : "persistence.crud.Users.create"});

	return(new Promise(function(resolve, reject) {

			// Validation
			var validation = preCondition.validate(params);
			console.log("validation is: " + validation);
			if(validation.errors !== null) {
				reject(validation.errors);
			}		

			// Persist
			var userModel = new UserModel(validation.data);
			userModel.save(function(error, user) {
				if(error) {
					var errorMessage		= new ErrorMessage();
					errorMessage.getErrorMessage({
						statusCode			: "500",
						errorMessage 		: "Failed while creating new user",
						sourceError			: error,
						sourceLocation	: "persistence.crud.Users.create"
					});
					reject(errorMessage.getErrors());
				}
				else {
					resolve(user);
				}
			});
			
		})
			
	);
}

/*
* Get all users
*/
Users.prototype.getAllUsers = function(params) {
	var preCondition = this.getPreCondition({ sourceLocation : "persistence.crud.Users.create"});
	var validation = preCondition.validate(params);
	return(new Promise(function(resolve, reject){

		if (validation.data.sessionId === null) {
			reject(validation.errors);
		} else {
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
					errorMessage 		: "Failed while getting users",
					sourceError			: e,
					sourceLocation	: "persistence.crud.Users.getAllAusers"
				});
				reject(errorMessage.getErrors());
			});
		}



	}));

	
}

/*
* Get a user by ID
*/
Users.prototype.getUserById = function (params) {
	var preCondition = this.getPreCondition({ sourceLocation : "persistence.crud.Users.getUserById"});
	var validation = preCondition.validate(params);
	return(new Promise(function(resolve, reject){
		if (validation.data.sessionId === null || validation.data.userId === null) {
			reject(validation.errors);
		} else {
			UsersModel.find({_id : validation.data.userId}).exec()
			.then(function(user){
				resolve(user);
			})
			.error(function(error){
				var errorMessage		= new ErrorMessage();
				errorMessage.getErrorMessage({
					statusCode			: "500",
					errorMessage 		: "Failed while getting user by Id",
					sourceError			: error,
					sourceLocation	: "persistence.crud.Users.getAllAusers"
				});
				reject(errorMessage.getErrors());
			});
		}

	}));

	
}

/*
* Get a user by email
*/
Users.prototype.getUserByEmail = function (params) {
	var preCondition = this.getPreCondition({ sourceLocation : "persistence.crud.Users.getUserByEmail"});
	var validation = preCondition.validate(params);
	return(new Promise(function(resolve, reject){
		if (validation.data.sessionId === null || validation.data.emailAddress === null) {
			reject(validation.errors);
		} else {
			UsersModel.find({emailAddress : validation.data.emailAddress}).exec()
			.then(function(user){
				resolve(user);
			})
			.error(function(error){
				var errorMessage		= new ErrorMessage();
				errorMessage.getErrorMessage({
					statusCode			: "500",
					errorMessage 		: "Failed while getting user by Email",
					sourceError			: error,
					sourceLocation	: "persistence.crud.Users.getUserByEmail"
				});
				reject(errorMessage.getErrors());
			});
		}

	}));

	
}


/*
* Get a user by user name
*/
Users.prototype.getUserByUserName = function (params) {
	var preCondition = this.getPreCondition({ sourceLocation : "persistence.crud.Users.getUserByUserName"});
	var validation = preCondition.validate(params);
	return(new Promise(function(resolve, reject){
		if (validation.data.sessionId === null || validation.data.emailAddress === null) {
			reject(validation.errors);
		} else {
			UsersModel.find({userName : validation.data.userName}).exec()
			.then(function(user){
				resolve(user);
			})
			.error(function(error){
				var errorMessage		= new ErrorMessage();
				errorMessage.getErrorMessage({
					statusCode			: "500",
					errorMessage		: "Failed while getting user by user name",
					sourceError			: error,
					sourceLocation	: "persistence.crud.Users.getUserByUserName"
				});
				reject(errorMessage.getErrors());
			});
		}
	}));
}

/*
* Update user information
*/
Users.prototype.update = function (params) {
	var preCondition = this.getPreCondition({ sourceLocation : "persistence.crud.Users.getUserByUserName"});
	var validation = preCondition.validate(params);
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
Users.prototype.delete = function(params) {
	var preCondition = this.getPreCondition({ sourceLocation : "persistence.crud.Users.getUserByUserName"});
	var validation = preCondition.validate(params);
	return(new Promise(function(resolve, reject){
		if (validation.data.sessionId === null || validation.data.userId === null) {
			reject(validation.errors);
		} else {
			UsersModel.delete({_id : validation.data.userId}).exec()
			.then(function(user){
				resolve(user);
			})
			.error(function(error){
				var errorMessage		= new ErrorMessage();
				errorMessage.getErrorMessage({
					statusCode			: "500",
					errorMessage 		: "Failed while deleting user",
					sourceError			: error,
					sourceLocation		: "persistence.crud.Users.delete"
				});
				reject(errorMessage.getErrors());
			});
		}
	}));
}

module.exports = new Users();
