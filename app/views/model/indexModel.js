var namespace = 'app.views.model.indexModel';

// IMPORT: BEGIN
var log4js 					= require('log4js');
var logger 					= log4js.getLogger(namespace);

try {
	var BaseModel 			= require('./baseModel');
	var catTypeCrud1_0_0 	= require('../../../app/persistence/crud/categoryType1-0-0');
	var userCrud1_0_0 		= require('../../../app/persistence/crud/users1-0-0');
	var videoCrud1_0_0 		= require('../../../app/persistence/crud/videos1-0-0');
	var sliderCrud1_0_0 	= require('../../../app/persistence/crud/slider1-0-0');
	var videoCollCrud1_0_0 	= require('../../../app/persistence/crud/videoCollection1-0-0');
	var TrendingVideo 		= require('../../../app/persistence/crud/trendingVideos');
	var config 				= require('../../../config/config')[global.NODE_ENV];
	var Promise 	 		= require('bluebird');
	var util		 		= require('util');
	var amazonConfig 		= require('../../config/amazon.config');
	var _ 					= require('lodash');

	if(global.NODE_ENV === "production") {
		logger.setLevel("WARN");	
	}

	logger.info("import complete");	
}
catch(exception) {
	logger.error(" import error:" + exception);
}
// IMPORT: END

var IndexModel = function (params) {
	BaseModel.apply(this, arguments);
};

util.inherits(IndexModel, BaseModel);

IndexModel.prototype.getData = function (params) {
	var userId = params.request.params.id;

	params.data = {};

	params.data.index = {};
	params.data.index.fb = config.view.fb;
	params.data.index.head = {};
	params.data.index.head.og = config.view.index.og;
	params.data.index.head.title = "AirVūz – World’s Best Drone Videos";
	params.data.index.viewName = "index";

	params.data.s3Bucket = amazonConfig.OUTPUT_BUCKET;

	var promises = [
		catTypeCrud1_0_0.get(),
		videoCollCrud1_0_0.getFeaturedVideos(),
		videoCrud1_0_0.getRecentVideos(),
		TrendingVideo.getVideos({total: 50, page: 1}),
		videoCollCrud1_0_0.getStaffPickVideos(),
		sliderCrud1_0_0.getHomeSlider(params.request.query.banner),
		userCrud1_0_0.emailConfirm(userId)
	];

	return Promise.all(promises)
		.spread(function (categories, featureVideos, recentVideos, trendingVideos, staffPickVideos, slider, isEmailConfirm) {
			params.data.categories = categories;
			params.data.index.featuredVideos = featureVideos;
			params.data.index.recentVideos = recentVideos;
			var videoToOmit = [];

			featureVideos.concat(staffPickVideos).forEach(function toOmit(video) {
				videoToOmit.push(video._id.toString());
			});

			params.data.index.trendingVideos = _.chain(trendingVideos).reject(function (video) {
				return videoToOmit.indexOf(video._id.toString()) > -1;
			}).take(20).value();

			params.data.index.staffPickVideos = staffPickVideos;
			params.data.index.slider = slider;

			if (userId) {
				params.data.emailConfirm = isEmailConfirm;
			}
			return params;
		});

};

module.exports = IndexModel;