try {
	var Promise = require('bluebird');
	var log4js = require('log4js');
	var logger = log4js.getLogger('persistance.crud.Videos');
	var ErrorMessage = require('../../utils/errorMessage');
	var ObjectValidationUtil = require('../../utils/objectValidationUtil');
	var PersistenceException = require('../../utils/exceptions/PersistenceException');
	var ValidationException = require('../../utils/exceptions/ValidationException');
	var VideoModel = null;
	var database = require('../database/database');

	VideoModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.videos"});
	logger.debug('loaded videos model');

	if(global.NODE_ENV === "production") {
		logger.setLevel("INFO");
	}

	logger.debug("import complete");
}
catch(exception) {
	logger.error(" import error:" + exception);
}

var Videos = function() {
	
};

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
		
		//logger.debug(".getPreCondition: params.description:" + params.description);
		
		var errorMessage				= new ErrorMessage();
		this.data.userId				= params.userId || null;
		this.data.title					= params.title || null;
		this.data.description		= params.description || null;
		this.data.duration			= params.duration || null;
		this.data.videoPath			= params.videoPath || null;
		this.data.thumbnailPath	= params.thumbnailPath || null;		
		
		if(this.data.userId === null) {
			this.errors = errorMessage.getErrorMessage({
				errorId					: "USERID1000",
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
};

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
	//console.log(params);
	
	
	var preCondition = this.getPreCondition({ sourceLocation : "persistence.crud.Videos.create"});

	return(new Promise(function(resolve, reject) {

			// Validation
			var validation = preCondition.validate(params);
			if(validation.errors !== null) {
				var validationException = new ValidationException({ errors : validation.errors });
				return reject(validationException);
			}

			// Persist
			var videoModel = new VideoModel(validation.data);
			videoModel.save(function(error, video) {
				if(error) {
					//console.log(error);
					logger.error(error);
					var errorMessage		= new ErrorMessage();
					errorMessage.getErrorMessage({
						errorId					: "PERS1000",
						sourceError			: error,
						sourceLocation	: "persistence.crud.Videos.create"
					});

					var persistenceException = new PersistenceException({ errors : errorMessage.getErrors() });
					reject(persistenceException);
				}
				else {
					resolve(video);
				}
			});
			
		})
			
	);
};

//Videos.prototype.get = function() {
//	VideoModel.find({}).exec()
//	.then(function(videos) {
//		return res.send(videos);
//	})
//	.catch(function(err) {
//		return err;
//	})
//};

Videos.prototype.get5Videos = function() {
	return VideoModel.find({}).limit(5).exec();
}

Videos.prototype.getById = function(id) {
	return VideoModel.findById({_id: id}).populate('categories').exec();
};

Videos.prototype.remove = function(id) {
	return VideoModel.findByIdAndRemove({_id: id}).exec();
};

Videos.prototype.update = function(params) {
	return VideoModel.findByIdAndUpdate(params.id, params.update, { new:true } ).exec();
};

module.exports = new Videos();
