var Promise											= require('bluebird');
var mongoose										= require('mongoose');
var log4js											= require('log4js');
var logger											= log4js.getLogger('persistance.crud.Videos');
var ErrorMessage								= require('../../utils/errorMessage');
var ObjectValidationUtil				= require('../../utils/objectValidationUtil');
var VideoModel									= mongoose.model('Video');

var Videos = function() {
	
}

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
Videos.prototype.getPreCondition = function(params) {
	/*
	 * @type {string}
	 */
	var sourceLocation	= params.sourceLocation;
	
	/*
	 * @type {Object}
	 */
	var preCondition		= new ObjectValidationUtil();
	
	preCondition.setValidation(function(params) {
		var errorMessage				= new ErrorMessage();
		var sessionId						= params.sessionId || null;
		var userId							= params.userId || null;
		this.data.title					= params.title || null;
		this.data.description		= params.description || null;
		this.data.duration			= params.duration || null;
		this.data.videoPath			= params.videoPath || null;
		this.data.thumbnailPath	= params.thumbnailPath || null;		
		
		if(userId === null) {
			this.errors = errorMessage.getErrorMessage({
				errorId					: "USERID1000",
				sourceLocation	: sourceLocation
			});
		}			
		
		if(sessionId === null) {
			this.errors = errorMessage.getErrorMessage({
				errorId					: "SESSIONID1000",
				sourceLocation	: sourceLocation
			});
		}
		
		if(this.data.description === null) {
			this.errors = errorMessage.getErrorMessage({
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "description"
				},
				sourceLocation	: sourceLocation
			});
		}		
		
		if(this.data.title === null) {
			this.errors = errorMessage.getErrorMessage({
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "title"
				},
				sourceLocation	: sourceLocation
			});
		}
				
	});
	return(preCondition);
}

/*
 * Create a new Video document.
 * @param params 				       {Object}
 * @param params.title 	       {string}
 * @param params.description   {string}
 * @param params.duration      {string}
 * @param params.videoPath     {string}
 * @param params.thumbnailPath {string}
 */
Videos.prototype.create = function(params) {
	
	
	
	var preCondition = this.getPreCondition({ sourceLocation : "persistence.crud.Videos.create"});

	return(new Promise(function(resolve, reject) {

			// Validation
			var validation = preCondition.validate(params);
			if(validation.errors !== null) {
				reject(validation.errors);
			}		

			// Persist
			var videoModel = new VideoModel(validation.data);
			videoModel.save(function(error, video) {
				if(error) {
					var errorMessage		= new ErrorMessage();
					errorMessage.getErrorMessage({
						errorId					: "PERS1000",
						sourceError			: error,
						sourceLocation	: "persistence.crud.Videos.create"
					});
					reject(errorMessage.getErrors());
				}
				else {
					resolve(video);
				}
			});
			
		})
			
	);
}

module.exports = new Videos();