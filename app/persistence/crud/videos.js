try {
	var Promise = require('bluebird');
	var log4js = require('log4js');
	var logger = log4js.getLogger('app.persistence.crud.videos');
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
 * @param params {Object}
 * @param params.page {Number}
 * @param params.total {Number}
 * @returns {Promise}
 */
function getRecentVideos(params) {
	if (!params) {
		params = {
			total: 10,
			page: 1
		}
	}

	var limit = params.total;
	var skip = (params.page - 1) * limit;

	return VideoModel
		.find()
		.sort('-uploadDate')
		.select('thumbnailPath title viewCount duration categories userId uploadDate')
		.skip(skip)
		.populate('userId', 'userNameDisplay userNameUrl')
		.populate('categories', 'name categoryTypeUrl')
		.limit(limit)
		.lean()
		.exec()
		.then(updateDateWithMoment);
}

/**
 * helper to convert uploadDate to moment from now
 * @param videos
 * @returns {*}
 */
function updateDateWithMoment(videos) {
	return videos.map(function (video) {
		video.uploadDate = moment(new Date(video.uploadDate)).fromNow();
		return video;
	});
}

/**
 * get trending video -
 * @param params {Object}
 * @param params.total {Number}
 * @param params.page {Number}
 * @param params.days {Number}
 * @returns {*}
 */
function getTrendingVideos(params) {
	if (!params) {
		params = {
			total: 10,
			page: 1
		}
	}

	var limit = params.total;
	var skip = (params.page - 1) * limit;
	var thirtyDayAgo = moment().subtract(14, 'days').toDate();

	return VideoModel
		.find({uploadDate: {$gte: thirtyDayAgo}})
		.sort('-viewCount')
		.select('thumbnailPath title viewCount duration categories userId uploadDate')
		.skip(skip)
		.populate('userId', 'userNameDisplay userNameUrl')
		.populate('categories', 'name categoryTypeUrl')
		.limit(limit)
		.lean()
		.exec()
		.then(updateDateWithMoment);
}

function getVideoByCategory(params) {
	var limit = params.total ? params.total : 10;
	var skip = (params.page ? (params.page - 1) : 0) * limit;

	return VideoModel
		.find({categories: params.categoryId})
		.sort('-' + (params.sort ? params.sort : 'uploadDate'))
		.select('thumbnailPath title viewCount duration categories userId uploadDate')
		.skip(skip)
		.populate('userId', 'userNameDisplay userNameUrl')
		.populate('categories', 'name categoryTypeUrl')
		.limit(limit)
		.lean()
		.exec()
		.then(updateDateWithMoment);
}

function getVideosByFollow(params) {
	var limit = params.total ? params.total : 10;
	var skip = (params.page ? (params.page - 1) : 0) * limit;

	return VideoModel
		.find({userId: {$in: params.users}})
		.sort('-' + (params.sort ? params.sort : 'uploadDate'))
		.select('thumbnailPath title viewCount duration categories userId uploadDate')
		.skip(skip)
		.populate('userId', 'userNameDisplay userNameUrl')
		.populate('categories', 'name categoryTypeUrl')
		.limit(limit)
		.lean()
		.exec()
		.then(updateDateWithMoment);
}

function search(query, page) {
	if (!query) {
		return Promise.resolve({videos: [], totalVideo: 0});
	}
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

	var userNameSearch = UserModel.purgeUserNameDisplay(keywords);

	keywords += '|' + keyWordNonCommon;
	// have to purge user name to time like this because of the "|"
	userNameSearch += '|' + UserModel.purgeUserNameDisplay((keyWordNonCommon));

	return UserModel.findOne({
		$or: [
			{
				'userNameUrl': {$regex: new RegExp(userNameSearch, 'i')}
			}
		]
	}).select('userNameUrl').exec()
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
						description: {$regex: new RegExp(keywords, 'i')}
					},
					{
						title: {$regex: new RegExp(keywords, 'i')}
					},
					{
						videoLocation: {$regex: new RegExp(keywords, 'i')}
					},
					{
						'tags.text': {$regex: new RegExp(keywords, 'i')}
					}
				]
			};

			foundVideo = VideoModel
				.find(criteria)
				.select('thumbnailPath title viewCount duration categories userId uploadDate')
				.sort({uploadDate: -1, viewCount: -1})
				.skip(skip)
				.limit(limit)
				.populate('userId', 'userNameDisplay userNameUrl')
				.populate('categories', 'name categoryTypeUrl')
				.lean()
				.exec()
				.then(updateDateWithMoment);

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
				statusCode			: "400",
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "description"
				},
				sourceError			: "#description",
				displayMsg			: "This field is required",
				errorMessage		: "field required",
				sourceLocation	: sourceLocation
			});
		}
		
		if(this.data.title === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "title"
				},
				sourceError			: "#title",
				displayMsg			: "This field is required",
				errorMessage		: "field required",
				sourceLocation	: sourceLocation
			});
		}
		
		if(this.data.categories.length === 0) {
			this.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "category"
				},
				sourceError			: "#category",
				displayMsg			: "This field is required",
				errorMessage		: "field required",
				sourceLocation	: sourceLocation
			});
		}

		if(this.data.droneType === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "drone-type"
				},
				sourceError			: "#drone-type",
				displayMsg			: "This field is required",
				errorMessage		: "field required",
				sourceLocation	: sourceLocation
			});
		}

		if(this.data.cameraType === null) {
			this.errors = errorMessage.getErrorMessage({
				statusCode			: "400",
				errorId					: "VALIDA1000",
				templateParams	: {
					name : "camera-type"
				},
				sourceError			: "#camera-type",
				displayMsg			: "This field is required",
				errorMessage		: "field required",
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
	//logger.debug(params);

	var preCondition = this.getPreCondition({ sourceLocation : "persistence.crud.Videos.create"});

	return(new Promise(function(resolve, reject) {

			// Validation
			var validation = preCondition.validate(params);
			if(validation.errors !== null) {
				throw validation.errors
			} else {
				var videoModel = new VideoModel(validation.data);
				videoModel.save(function(error, video) {
					if(error) {
						//logger.debug(error);
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
			}
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

/**
 * get next videos by category
 * @param category
 * @returns {Promise}
 */
Videos.prototype.getNextVideos = function(category) {
	return VideoModel.find({categories: category})
		.count()
		.exec()
		.then(function(videoCount) {
			var skip = Math.floor(Math.random() * videoCount);

			return VideoModel.find({categories: category})
				.skip(skip)
				.populate('userId')
				.limit(5)
				.exec();
		})
		.then(function(videos) {
			return videos;
		});
};

Videos.prototype.getById = function(id) {
	logger.debug('.getByID : id : ' + id);
	return VideoModel.findById(id)
		.populate('categories')
		.lean()
		.exec();
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
		return VideoModel.find({userId: id, isShowcase: true}).populate('userId').lean().exec();
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

Videos.prototype.totalVideosByEndDate = function(endDate) {
	return VideoModel.find({uploadDate: {$lte: new Date(endDate)}})
		.count()
		.exec()
};

Videos.prototype.newVideosBetweenDates = function(startDate, endDate) {
	return VideoModel.find({uploadDate: {$gte: new Date(startDate), $lte: new Date(endDate)}})
		.count()
		.exec()
};

Videos.prototype.getByUserAndDate = function(userId, startDate, endDate) {
	return VideoModel.find({userId: userId, uploadDate: {$gte: new Date(startDate), $lte: new Date(endDate)}}).exec()
};

Videos.prototype.getByUser = function(userId, sortBy) {
	var sort = {};
	if (!sortBy) {
		sort = {uploadDate: -1};
	} else {
		switch(sortBy) {
			case 'vuz' :
				sort = {viewCount: -1};
				break;
			case 'dasc' :
				sort = {uploadDate: 1};
				break;
			case 'ddesc' :
				sort = {uploadDate: -1};
				break;
			default:
				sort = {likeCount: 1};
				break;
		}
	}

	return VideoModel.find({userId: userId})
		.sort(sort)
		.select('title thumbnailPath viewCount uploadDate duration userId')
		.populate('userId', 'userNameDisplay userNameUrl')
		.exec();
};

Videos.prototype.getVideoCount = function(userId) {
	return VideoModel.find({userId: userId}).count().exec();
};

Videos.prototype.getTopSixVideos = function(userId) {
	return VideoModel.find({userId: userId}).sort({viewCount: -1}).limit(6).exec();
};

/**
 * update video view count
 * @param video - mongoose model
 * @returns {Promise}
 */
Videos.prototype.upCount = function(video) {
	return VideoModel.findByIdAndUpdate(video._id, {$inc: {viewCount: 1}}).exec();
};


Videos.prototype.findByUserId = function(id) {
	return VideoModel.find({userId: id}).exec()
};

Videos.prototype.findByUserIdAndDate = function(userId, startDate, endDate) {
	return VideoModel.find({userId: userId, uploadDate: {$gte: new Date(startDate), $lte: new Date(endDate)}}).count().exec();
};

Videos.prototype.getRecentVideos 		= getRecentVideos;
Videos.prototype.getTrendingVideos 	= getTrendingVideos;
Videos.prototype.getVideoByCategory = getVideoByCategory;
Videos.prototype.search 						= search;
Videos.prototype.getVideosByFollow 	= getVideosByFollow;

module.exports = new Videos();
