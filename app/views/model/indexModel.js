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
	logger.debug("constructor: IN");	
	
	BaseModel.apply(this, arguments);
}

util.inherits(IndexModel, BaseModel);

IndexModel.prototype.getData = function(params) {	
	logger.info("getData ");	
	var sourceManifest	= params.sourceManifest;
	var THIS						= this;
	var userId					= params.request.params.id;
	return new Promise(function(resolve, reject) {
		logger.info("getData 1.0");
		logger.info("getData sourceManifest['airvuz.css']:" + sourceManifest["airvuz.css"]);
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

		Promise.all([CategoryType.get(), VideoCollection.getFeaturedVideos(), Videos.getRecentVideos(), Videos.getTrendingVideos(), VideoCollection.getStaffPickVideos(), Slider.getHomeSlider(params.request.query.banner), User.emailConfirm(userId)])
			.then(function(data) {
				params.data.categories = data[0];
				params.data.index.featuredVideos = data[1];
				params.data.index.recentVideos = data[2];
				params.data.index.trendingVideos = data[3];
				params.data.index.staffPickVideos = data[4];
				params.data.index.slider = data[5];
				if(userId) {
					console.log('userId : ' + userId);
					params.data.emailConfirm = data[6];
					console.log(params.data.emailConfirm)
				}
				resolve(params);
			})
			.catch(function(error) {
				reject(error);
			});
	});

};

module.exports = IndexModel;