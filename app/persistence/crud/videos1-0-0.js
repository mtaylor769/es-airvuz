var namespace = 'app.persistence.crud.videos1-0-0';
try {
	var Promise = require('bluebird');
	var log4js = require('log4js');
	var logger = log4js.getLogger(namespace);
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
		.select('thumbnailPath title viewCount duration categories userId uploadDate videoPath')
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
	// TODO: allow searching category
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

	return UserModel.find({
		$or: [
			{
				'userNameUrl': {$regex: new RegExp(userNameSearch, 'i')}
			}
		]
	}).select('userNameUrl').exec()
		.then(function (users) {
			var userId = [],
					criteria,
					foundVideo,
					videoCount;

			if (users) {
				users.forEach(function (user) {
					userId.push(user._id);
				});
			}

			criteria = {
				isActive: true,
				$or: [
					{
						userId: {$in: userId}
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
						tags: {$regex: new RegExp(keywords, 'i')}
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
				return {videos: videos, totalVideo: count, page: page};
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
		var errorMessage				= new ErrorMessage();
		this.data.userId				= params.userId || null;
		this.data.title					= params.title || null;
		this.data.description			= params.description || null;
		this.data.duration				= params.duration || null;
		this.data.videoPath				= params.videoPath || null;
		this.data.thumbnailPath			= params.thumbnailPath || null;
		this.data.tags					= params.tags || null;
		this.data.categories			= params.categories || null;
		this.data.videoLocation			= params.videoLocation || null;
		this.data.droneType				= params.droneType || null;
		this.data.cameraType			= params.cameraType || null;

		if(this.data.userId === null) {
			this.errors = errorMessage.getErrorMessage({
				errorId					: "USERID1000",
				sourceLocation	: sourceLocation
			});
		}
		
		if(this.data.description === null || this.data.description.length === 0) {
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
		
		if(this.data.title === null || this.data.title.length === 0) {
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
				errorId				: "VALIDA1000",
				templateParams	: {
					name : "category"
				},
				sourceError			: "#category",
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

/**
 * get next videos by category
 * - get 4 rank videos and 1 random video in same category
 * @param category
 * @returns {Promise} - 5 videos
 */
Videos.prototype.getNextVideos = function(category) {
	var waitFor = Promise.all([
			_getVideo({categories: category, internalRankAvg: {$gte: 4}}, 4), // get by internal rank
			_getVideo({categories: category}, 5) // get by category
		]);

	return waitFor.spread(function (rankVideo, categoryVideo) {
		if (rankVideo.length > 0) {
      return rankVideo.concat(categoryVideo.slice(0, 1)); // 4 internal + 1 category
		}
		return categoryVideo; // 0 internal + 5 category
	});
};

function _getVideo(query, limit) {
  return VideoModel.find(query)
    .count()
    .exec()
    .then(function(videoCount) {
      var skip = Math.floor(Math.random() * videoCount);

      return VideoModel.find(query)
        .skip(skip)
        .populate('userId')
        .limit(limit)
        .lean()
        .exec();
    })
    .then(function(videos) {
      return videos;
    });
}

Videos.prototype.getByIdAndPopulateUser = function(id) {
	return VideoModel.findById(id)
		.populate('userId')
		.lean()
		.exec()
};

Videos.prototype.remove = function(id) {
	return VideoModel.findByIdAndRemove({_id: id}).exec();
};

Videos.prototype.update = function(params) {
	var preCondition = this.getPreCondition({ sourceLocation : "persistence.crud.Videos.update"});
	var validation = preCondition.validate(params.update);

	if(validation.errors !== null) {
		throw validation.errors;
	} else {
		return VideoModel.findByIdAndUpdate(params.id, params.update, { new:true } ).exec();
	}
};

Videos.prototype.updateVideoFieldCounts = function(params) {
	return VideoModel.findByIdAndUpdate(params.id, params.update, { new:true } ).exec();
};

Videos.prototype.videoCurationUpdate = function(params) {
	return VideoModel.findByIdAndUpdate(params.id, {$push: {internalRanking: params.internalRanking}}, {upsert: true, new: true}).then(function(newVideoObject) {
		//gets new array of internal rankings
		var newRankArray = newVideoObject.internalRanking;
		//runs a reduce against array to get the sum of all the values
		var newRankArraySum = newRankArray.reduce(function(a, b) {
			return a + b;
		});
		//divides the sum of reduce by the length of the array and sets it to the internalRankAvg property
		var internalRankAverage = (newRankArraySum / (newRankArray.length));
		if(params.update) {
			//adds to update if there are other updates going into the update
			params.update.internalRankAvg = internalRankAverage;
			return VideoModel.findByIdAndUpdate(params.id, params.update).exec();
		} else {
			//updates average if there are no other updates going in.... WILL ALWAYS HAVE INTERNAL RANK ON UPDATE
			return VideoModel.findByIdAndUpdate(params.id, {internalRankAvg: internalRankAverage}).exec();
		}
	});
};

Videos.prototype.like = function(video, like) {
	if (like === 'plus') {
		video.likeCount = video.likeCount + 1;
	} else {
		video.likeCount = video.likeCount - 1;
	}
  return video.save();
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
		.select('title thumbnailPath viewCount uploadDate duration userId categories description')
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


/**
 * increment viewCount by video ID
 */
Videos.prototype.incrementViewCountById = function(params) {
	videoId = params.videoId;
	return VideoModel.findByIdAndUpdate(videoId, {$inc: {viewCount: 1}}).exec();
};


/**
 * increment autoView count
 */

Videos.prototype.incrementAutoViewCountById = function (params) {
	var videoId = params.videoId;
	return VideoModel.findByIdAndUpdate(videoId, {$inc: {autoViewCount: 1}}).exec();
}

/**
 * Apply increment to both view count and autoview count
 * @param params
 */
Videos.prototype.applyAutoView = function (params) {
	var videoId = params.videoId;


	VideoModel.findByIdAndUpdate(videoId, {$inc: {viewCount: 1, autoViewCount: 1}}).exec()
		.then ( function () {} )
		.catch( function (err){
			logger.error (err);
		});

}

Videos.prototype.findByUserId = function(id) {
	return VideoModel.find({userId: id}).exec()
};

Videos.prototype.findByUserIdAndDate = function(userId, startDate, endDate) {
	return VideoModel.find({userId: userId, uploadDate: {$gte: new Date(startDate), $lte: new Date(endDate)}}).count().exec();
};

//function will return a video object with the categories populated
Videos.prototype.getNextVideoToRate = function(nextVideoParams) {
	var videoIdCheck = nextVideoParams ? nextVideoParams.videoId : null;
	var execute;

	if(!videoIdCheck) {
		//checks for params otherwise will run default
		switch(nextVideoParams ? nextVideoParams.type : '') {
			//case nextVideoParams.type === 'contributor'
			case 'contributor':
				execute = VideoModel.find({'userId' : nextVideoParams.value, 'curation.isRanked' : null});
				break;

			//case nextVideoParams.type === 'category'
			case 'category':
				execute = VideoModel.find({'categories' : nextVideoParams.value, 'curation.isRanked' : null});
				break;

			//case nextVideoParams.type === 'internal'
			case 'internal':
				execute = VideoModel.find({'internalTags' : []});
				break;

			//case nextVideoParams.type === 'seo'
			case 'seo':
				execute = VideoModel.find({'seoTags': []});
				break;

			//case nextVideoParams.type === 'primaryCategory'
			case 'primaryCategory':
				execute = VideoModel.find({'primaryCategory': null});
				break;

			//case nextVideoParams.type === typeOf 'undefined' || non-valid param
			default:
				execute = VideoModel.find({'curation.isRanked' : null});
				break;
		}
	} else {
		return VideoModel.findById(nextVideoParams.videoId)
			.populate('categories')
			.populate('primaryCategory')
			.lean()
			.exec();
	}

	//consolidated mongoose execute code will return mongoose query and run execution function
	return execute
		.sort({viewCount: -1})
		.limit(1)
		.populate('categories')
		.populate('primaryCategory')
		.lean()
		.exec();
};

function findVideoBySeoKeyword(keyword) {
	return VideoModel.find({seoTags: keyword})
		.populate('categories')
		.populate('user', 'userNameDisplay userNameUrl')
		.exec()
}

function getById(id) {
  return VideoModel.findById(id)
    .populate('categories')
    .populate('primaryCategory')
    .lean()
    .exec();
}

/*
 * @params {String} [id] - video id
 */
function getVideoLocationById(id) {
	return VideoModel
		.findById(id)
		.populate('videoCoordinates')
		.lean()
		.exec();
}

Videos.prototype.getRecentVideos 				= getRecentVideos;
Videos.prototype.getVideoByCategory 		= getVideoByCategory;
Videos.prototype.search 								= search;
Videos.prototype.getVideosByFollow 			= getVideosByFollow;
Videos.prototype.findVideoBySeoKeyword 	= findVideoBySeoKeyword;
Videos.prototype.getById 								= getById;
Videos.prototype.getVideoLocationById			= getVideoLocationById;

module.exports = new Videos();
