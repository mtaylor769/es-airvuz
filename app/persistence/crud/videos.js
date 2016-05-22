try {
	var Promise = require('bluebird');
	var log4js = require('log4js');
	var logger = log4js.getLogger('persistance.crud.Videos');
	var ErrorMessage = require('../../utils/errorMessage');
	var ObjectValidationUtil = require('../../utils/objectValidationUtil');
	var PersistenceException = require('../../utils/exceptions/PersistenceException');
	var ValidationException = require('../../utils/exceptions/ValidationException');
	var VideoModel = null;
	var UserModel = null;
	var database = require('../database/database');
	var moment = require('moment');

	VideoModel 	= database.getModelByDotPath({modelDotPath: "app.persistence.model.videos"});
	UserModel 	= database.getModelByDotPath({modelDotPath: "app.persistence.model.users"});

	if(global.NODE_ENV === "production") {
		logger.setLevel("INFO");
	}

	logger.debug("import complete");
}
catch(exception) {
	logger.error(" import error:" + exception);
}

var Videos = function() {};

/**
 * get the recent uploaded videos
 * @param count
 * @param page
 * @returns {Promise}
 */
function getRecentVideos(count, page) {
	var limit = count ? count : 10;
	var skip = (page ? (page - 1) : 0) * limit;

	return VideoModel
			.find()
			.sort('-uploadDate')
			.select('thumbnailPath title viewCount duration categories userId')
			.skip(skip)
			.populate('userId', 'userName')
			.populate('categories', 'name categoryTypeUrl')
			.limit(limit)
			.exec();
}

function getTrendingVideos(count, page) {
	var limit = count ? count : 10;
	var skip = (page ? (page - 1) : 0) * limit;
	var thirtyDayAgo = moment().subtract(30, 'days').toDate();

	return VideoModel
			.find({uploadDate: {$gte: thirtyDayAgo}})
			.sort('-viewCount')
			.select('thumbnailPath title viewCount duration categories userId')
			.skip(skip)
			.populate('userId', 'userName')
			.populate('categories', 'name categoryTypeUrl')
			.limit(limit)
			.exec();
}

function getVideoByCategory(count, page, categoryId) {
	var limit = count ? count : 10;
	var skip = (page ? (page - 1) : 0) * limit;

	return VideoModel
			.find({categories: categoryId})
			.sort('-uploadDate')
			.select('thumbnailPath title viewCount duration categories userId')
			.skip(skip)
			.populate('userId', 'userName')
			.populate('categories', 'name categoryTypeUrl')
			.limit(limit)
			.exec();
}

function search(query, page) {
	// TODO: allow searching category, drone, and camera
	var keywords = query,
			commonWords = ['the', 'of', 'and'],
			limit = 20,
			words = keywords.split(' '),
			keyWordNonCommon = '',
			skip = (page ? (page - 1) : 0) * limit;

	words.forEach(function (word) {
		if (commonWords.indexOf(word) < 0) {
			keyWordNonCommon += word + '.*';
		}
	});

	keywords += '|' + keyWordNonCommon;

	return UserModel.findOne({
		$or: [
			{
				'userName': {$regex: new RegExp(keywords.toLowerCase(), 'i')}
			}
		]
	}).select('userName').exec()
		.then(function (user) {
			var userId = null,
					criteria,
					foundVideo,
					videoCount;

			if (user) {
				userId = user._id;
			}

			criteria = {
				isActive: true,
				$or: [
					{
						userId: userId
					},
					{
						description: {$regex: new RegExp(keywords.toLowerCase(), 'i')}
					},
					{
						title: {$regex: new RegExp(keywords.toLowerCase(), 'i')}
					},
					{
						videoLocation: {$regex: new RegExp(keywords.toLowerCase(), 'i')}
					},
					{
						'tags.text': {$regex: new RegExp(keywords.toLowerCase(), 'i')}
					}
				]
			};

			foundVideo = VideoModel
					.find(criteria)
					.select('thumbnailPath title viewCount duration categories userId')
					.sort({uploadDate: -1, viewCount: -1})
					.skip(skip)
					.limit(limit)
					.populate('userId', 'userName')
					.populate('categories', 'name categoryTypeUrl')
					.exec();

			videoCount = VideoModel
					.count(criteria)
					.exec();

			return Promise.all([
				foundVideo,
				videoCount
			]).spread(function (videos, count) {
				return {videos: videos, totalVideo: count};
			});
		});
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
		
		//logger.debug(".getPreCondition: params.description:" + params.description);
		
		var errorMessage				= new ErrorMessage();
		this.data.userId				= params.userId || null;
		this.data.title					= params.title || null;
		this.data.description		= params.description || null;
		this.data.duration			= params.duration || null;
		this.data.videoPath			= params.videoPath || null;
		this.data.thumbnailPath	= params.thumbnailPath || null;
		this.data.tags					= params.tags || null;
		this.data.categories		= params.categories || null;
		this.data.droneType			= params.droneType || null;
		this.data.cameraType		= params.cameraType || null;
		this.data.videoLocation	= params.videoLocation || null;

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

Videos.prototype.get5Videos = function(count) {
	var random = Math.floor(Math.random() * 500);
	var limit = count ? count : 5;
	return VideoModel.find({}).skip(random).populate('userId').limit(limit).exec();
};

Videos.prototype.getById = function(id) {
	logger.debug('.getByID : id : ' + id);
	return VideoModel.findById(id).populate('categories').exec();
};

Videos.prototype.remove = function(id) {
	return VideoModel.findByIdAndRemove({_id: id}).exec();
};

Videos.prototype.update = function(params) {
	return VideoModel.findByIdAndUpdate(params.id, params.update, { new:true } ).exec();
};

Videos.prototype.like = function(video, like) {
	if(like === 'plus') {
		video.likeCount = video.likeCount + 1;
		return video.save();
	} else {
		video.likeCount = video.likeCount - 1;
		return video.save();
	}
};

Videos.prototype.getShowcaseByUser = function(id, sortBy) {
	if (!sortBy) {
		return VideoModel.find({userId: id, isShowcase: true}).populate('userId').exec();
	} else {
		switch(sortBy) {
			case 'vuz' :
				return VideoModel.find({userId: userId, isShowcase: true}).sort({viewCount: -1}).populate('userId').exec();
			case 'dasc' :
				return VideoModel.find({userId: userId, isShowcase: true}).sort({uploadDate: 1}).populate('userId').exec();
			case 'ddesc' :
				return VideoModel.find({userId: userId, isShowcase: true}).sort({uploadDate: -1}).populate('userId').exec();
			default:
				return VideoModel.find({userId: userId, isShowcase: true}).sort({likeCount: 1}).populate('userId').exec();
		}
	}
	
};

Videos.prototype.getByUser = function(userId, sortBy) {
	if (!sortBy) {
		return VideoModel.find({userId: userId}).sort({uploadDate: -1}).populate('userId').exec();
	} else {
		switch(sortBy) {
			case 'vuz' :
				return VideoModel.find({userId: userId}).sort({viewCount: -1}).populate('userId').exec();
			case 'dasc' :
				return VideoModel.find({userId: userId}).sort({uploadDate: 1}).populate('userId').exec();
			case 'ddesc' :
				return VideoModel.find({userId: userId}).sort({uploadDate: -1}).populate('userId').exec();
			default:
				return VideoModel.find({userId: userId}).sort({likeCount: 1}).populate('userId').exec();
		}
	}
};

Videos.prototype.getVideoCount = function(userId) {
	return VideoModel.find({userId: userId}).count().exec();
};

Videos.prototype.getTopTwoVideos = function(userId) {
	return VideoModel.find({userId: userId}).sort({viewCount: -1}).limit(2).exec();
};

Videos.prototype.upCount = function(video) {
	return video.save();
};

Videos.prototype.getRecentVideos 		= getRecentVideos;
Videos.prototype.getTrendingVideos 	= getTrendingVideos;
Videos.prototype.getVideoByCategory = getVideoByCategory;
Videos.prototype.search 						= search;

module.exports = new Videos();
