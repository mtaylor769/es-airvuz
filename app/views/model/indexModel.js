// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.model.index');

try {
	var BaseModel			= require('./baseModel');
	var CategoryType	= require('../../../app/persistence/crud/categoryType');
	var Videos				= require('../../../app/persistence/crud/videos');
	var config				= require('../../../config/config')[global.NODE_ENV];
	var Promise				= require('bluebird');
	var util					= require('util');

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
		params.data.index.head.title	= "AirVūz – Drone Video Community";
		params.data.index.viewName		= "index";

		var mockBanners = [
			{
				name: 'Name 1',
				imageUrl: '//airvuz.com/assets/img/slider/N5.jpg',
				imageAlt: 'Image Alt',
				videoUrl: '//airvuz.com/play?id=571142c22d8efb0ca430c27f',
				description: 'Description'
			}
		];

		if (params.request.query.banner) {
			mockBanners = [
				{
					name: 'Name 1',
					imageUrl: '//airvuz.com/assets/img/slider/N5.jpg',
					imageAlt: 'Image Alt',
					videoUrl: '//airvuz.com/play?id=571142c22d8efb0ca430c27f',
					description: 'Description'
				},
				{
					name: 'Name 2',
					imageUrl: '//airvuz.com/assets/img/slider/P1.jpg',
					imageAlt: 'Image Alt',
					videoUrl: '//airvuz.com/play?id=571142c22d8efb0ca430c27f',
					description: 'Description'
				}
			];
		}

		params.data.index.banners = mockBanners;

		Promise.all([CategoryType.get(), Videos.get5Videos()])
			.then(function(data) {
				params.data.index.categories = data[0];
				params.data.index.featuredVideos = data[1];
				params.data.index.recentVideos = data[1];
				params.data.index.trendingVideos = data[1];
				resolve(params);
			})
			.catch(function(error) {
				reject(error);
			});
	});

};

module.exports = IndexModel;