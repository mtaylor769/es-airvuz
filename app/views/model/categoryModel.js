var log4js					= require('log4js');
var logger					= log4js.getLogger('app.views.model.categoryModel');


try {
	var BaseModel				= require('./baseModel');
	var Promise					= require('bluebird');
	var util						= require('util');
	var Videos					= require('../../persistence/crud/videos');
	var CategoryType		= require('../../../app/persistence/crud/categoryType');
	var FollowCrud			= require('../../../app/persistence/crud/follow');
	var VideoCollection	= require('../../../app/persistence/crud/videoCollection');
	var amazonConfig  	= require('../../config/amazon.config');

	if(global.NODE_ENV === "production") {
		logger.setLevel("WARN");
	}
}
catch(exception) {
	logger.error(" import error:" + exception);
}

var CategoryModel = function(params) {
	BaseModel.apply(this, arguments);
};

util.inherits(CategoryModel, BaseModel);

/**
 * return category that can't sort
 * @param category
 * @returns {boolean}
 */
function canSort(category) {
	var categories = ['Featured Videos', 'Staff Pick Videos', 'Trending Videos', 'Recent Videos'];

	return !(categories.indexOf(category) > -1);
}

CategoryModel.prototype.getData = function(params) {

	var sourceManifest	= params.sourceManifest;

	params.data							= {};
	params.data.title				= "AirVūz – Category";
	params.data.airvuz			= {};
	params.data.airvuz.css	= sourceManifest["airvuz.css"];
	params.data.airvuz.js   = sourceManifest["airvuz.js"];
	params.data.vendor      = {};
	params.data.vendor.js   = sourceManifest["vendor.js"];
	params.data.viewName		= "Category";

	params.data.s3Bucket 		= amazonConfig.OUTPUT_URL;

	// Only category can sort
	params.data.showSort 		= canSort(params.request.params.category);

	var videoPromise,
			TOTAL_PER_PAGE = 20;

	params.data.category = {};
	
	var videosParam = {
		total: TOTAL_PER_PAGE,
		page: 1,
		sort: params.request.query.sort || 'uploadDate'
	};

	videoPromise = CategoryType.getByUrl(params.request.params.category)
		.then(function (category) {
			params.data.category.uri = params.request.params.category;
			params.data.category.name = params.request.params.category;
			switch(params.request.params.category) {
				case 'Featured Videos':
					return VideoCollection.getFeaturedVideos();
				case 'Staff Pick Videos':
					return VideoCollection.getStaffPickVideos();
				case 'Recent Videos':
					return Videos.getRecentVideos(videosParam);
				case 'Trending Videos':
					return Videos.getTrendingVideos(videosParam);
				case 'Following Videos':
					// Let the client side handle this because this server side render for the following require
					// current login user
					return Promise.resolve([]);
				default:
					params.data.category.name = category.name;
					videosParam.categoryId = category._id;
					return Videos.getVideoByCategory(videosParam);
			}
		});


	var promise = Promise.all([CategoryType.get(), videoPromise])
			.then(function(data) {
				params.data.categories = data[0];
				params.data.videos = data[1];
				// show the load more if there is data or category is 'Follower Videos'
				params.data.showLoadMore = data[1].length > 11 || params.request.params.category === 'Follower Videos';
				return params;
			});

	return Promise.resolve(promise);
};

module.exports = CategoryModel;