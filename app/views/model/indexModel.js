// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.model.indexModel');

try {
	var BaseModel				= require('./baseModel');
	var CategoryType		= require('../../../app/persistence/crud/categoryType');
	var User						= require('../../../app/persistence/crud/users');
	var Videos					= require('../../../app/persistence/crud/videos');
	var Slider					= require('../../../app/persistence/crud/slider');
	var VideoCollection	= require('../../../app/persistence/crud/videoCollection');
	var config					= require('../../../config/config')[global.NODE_ENV];
	var Promise					= require('bluebird');
	var util						= require('util');
	var amazonConfig  	= require('../../config/amazon.config');
	var _								= require('lodash');

	if(global.NODE_ENV === "production") {
		logger.setLevel("WARN");	
	}

	logger.info("import complete");	
}
catch(exception) {
	logger.error(" import error:" + exception);
}
// IMPORT: END

var IndexModel = function(params) {
	BaseModel.apply(this, arguments);
};

util.inherits(IndexModel, BaseModel);

IndexModel.prototype.getData = function(params) {
	var sourceManifest	= params.sourceManifest;
	var userId					= params.request.params.id;

	params.data										= {};
	params.data.airvuz			= {};
	params.data.airvuz.css	= sourceManifest["airvuz.css"];
	params.data.airvuz.js		= sourceManifest["airvuz.js"];
	params.data.vendor			= {};
	params.data.vendor.js		= sourceManifest["vendor.js"];

	params.data.index							= {};
	params.data.index.airvuz			= {};
	params.data.index.airvuz.css	= sourceManifest["airvuz.css"];
	params.data.index.airvuz.js		= sourceManifest["airvuz.js"];
	params.data.index.fb					= config.view.fb;
	params.data.index.head				= {};
	params.data.index.head.og			= config.view.index.og;
	params.data.index.head.title	= "AirVūz – World’s Best Drone Videos";
	params.data.index.viewName		= "index";

	params.data.s3Bucket 					= amazonConfig.OUTPUT_URL;
	params.data.s3AssetUrl 				= amazonConfig.ASSET_URL;

	var promises = [
		CategoryType.get(),
		VideoCollection.getFeaturedVideos(),
		Videos.getRecentVideos(),
		Videos.getTrendingVideos({total: 30, page: 1}),
		VideoCollection.getStaffPickVideos(),
		Slider.getHomeSlider(params.request.query.banner),
		User.emailConfirm(userId)
	];

	return Promise.all(promises)
		.spread(function(categories, featureVideos, recentVideos, trendingVideos, staffPickVideos, slider, isEmailConfirm) {
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

			if(userId) {
				params.data.emailConfirm = isEmailConfirm;
			}
			return params;
		});

};

module.exports = IndexModel;