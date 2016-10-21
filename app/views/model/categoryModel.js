var log4js					= require('log4js');
var logger					= log4js.getLogger('app.views.model.categoryModel');


try {
	var BaseModel			= require('./baseModel');
	var Promise				= require('bluebird');
	var util				= require('util');
	var videoCrud1_0_0		= require('../../persistence/crud/videos1-0-0');
	var CategoryType		= require('../../../app/persistence/crud/categoryType');
	var TrendingVideo		= require('../../../app/persistence/crud/trendingVideos');
	var VideoCollection		= require('../../../app/persistence/crud/videoCollection');
	var amazonConfig  		= require('../../config/amazon.config');
	var _					= require('lodash');

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
	var categories = ['featured-drone-videos', 'staff-picks-drone-videos', 'trending-drone-videos', 'latest-drone-videos'];

	return !(categories.indexOf(category) > -1);
}

CategoryModel.prototype.getData = function(params) {
	var currentCategory = params.request.params.category;
	var categoryNameMap = {
		'featured-drone-videos': 'Featured Drone Videos',
		'trending-drone-videos': 'Trending Drone Videos',
		'latest-drone-videos': 'Latest Drone Videos',
		'staff-picks-drone-videos': 'Staff Picks Drone videoCrud1_0_0',
		'following-drone-videos': 'Following Drone Videos'
	};
	params.data = {};
	params.data.s3Bucket = amazonConfig.OUTPUT_BUCKET;

	// Only category can sort
	params.data.showSort = canSort(currentCategory);

	var videoPromise,
		TOTAL_PER_PAGE = 20;

	params.data.category = {};

	var videosParam = {
		total: TOTAL_PER_PAGE,
		page: 1,
		sort: params.request.query.sort || 'uploadDate'
	};

	videoPromise = CategoryType.getByUrl(currentCategory)
		.then(function (category) {
			params.data.category.uri = currentCategory;
			params.data.category.name = categoryNameMap[currentCategory];
			switch (currentCategory) {
				case 'featured-drone-videos':
					return VideoCollection.getFeaturedVideos();
				case 'staff-picks-drone-videos':
					return VideoCollection.getStaffPickVideos();
				case 'latest-drone-videos':
					return videoCrud1_0_0.getRecentVideos(videosParam);
				case 'trending-drone-videos':
					var promises = [
						VideoCollection.getFeaturedVideos(),
						VideoCollection.getStaffPickVideos(),
						TrendingVideo.getVideos({total: 50, page: videosParam.page})
					];

					return Promise.all(promises)
						.spread(function (featureVideos, staffPickVideos, trendingVideos) {
							var videoToOmit = [];

							featureVideos.concat(staffPickVideos).forEach(function toOmit(video) {
								videoToOmit.push(video._id.toString());
							});

							return _.chain(trendingVideos).reject(function (video) {
								return videoToOmit.indexOf(video._id.toString()) > -1;
							}).take(20).value();
						});
				case 'following-drone-videos':
					// Let the client side handle this because this server side render for the following require
					// current login user
					return Promise.resolve([]);
				default:
					params.data.category.name = category.name;
					videosParam.categoryId = category._id;
					return videoCrud1_0_0.getVideoByCategory(videosParam);
			}
		});


	return Promise.all([CategoryType.get(), videoPromise])
		.spread(function (categories, videos) {
			params.data.categories = categories;
			params.data.videos = videos;
			// show the load more if there is data or category is 'Follower Videos'
			params.data.showLoadMore = videos.length > 11 || currentCategory === 'following-drone-videos' || currentCategory === 'trending-videos';

			// don't show load more button for featured and staff pick since there is no paging and video doesn't exceed over 40?
			if (currentCategory === 'featured-drone-videos' || currentCategory === 'staff-picks-drone-videos') {
				params.data.showLoadMore = false;
			}

			params.data.title = "AirVūz – " + params.data.category.name;
			return params;
		})
		.catch(function(error) {
			params.next();
		});

};

module.exports = CategoryModel;