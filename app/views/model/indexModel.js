// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.model.index');

try {
	var BaseModel			= require('./baseModel');
	var CategoryType	= require('../../../app/persistence/crud/categoryType');
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

		var mockVideos = [
			{
				title: 'BallonFest Arial Time Lapse',
				duration: '0:15',
				viewCount: 2427,
				userId: {
					userName: 'BottomUpProductions'
				},
				categories: [
					{
						name: 'Concerts & Events'
					}
				]
			},
			{
				title: 'Dolphins Playing off the Coast of Seaside Florida',
				duration: '0:15',
				viewCount: 2427,
				userId: {
					userName: '8 Fifty Productions'
				},
				categories: [
					{
						name: 'Nature & Wildlife'
					}
				]
			},
			{
				title: 'DJI Phantom 4 | Powerful and Creative Germany 4k',
				duration: '0:15',
				viewCount: 2427,
				userId: {
					userName: 'cyber_drone_'
				},
				categories: [
					{
						name: 'Travel'
					}
				]
			},
			{
				title: 'BallonFest Arial Time Lapse',
				duration: '0:15',
				viewCount: 2427,
				userId: {
					userName: 'BottomUpProductions'
				},
				categories: [
					{
						name: 'Concerts & Events'
					}
				]
			},
			{
				title: 'Dolphins Playing off the Coast of Seaside Florida',
				duration: '0:15',
				viewCount: 2427,
				userId: {
					userName: '8 Fifty Productions'
				},
				categories: [
					{
						name: 'Nature & Wildlife'
					}
				]
			},
			{
				title: 'DJI Phantom 4 | Powerful and Creative Germany 4k',
				duration: '0:15',
				viewCount: 2427,
				userId: {
					userName: 'cyber_drone_'
				},
				categories: [
					{
						name: 'Travel'
					}
				]
			}
		];

		params.data.index.featuredVideos = mockVideos;
		params.data.index.recentVideos = mockVideos;
		params.data.index.trendingVideos = mockVideos;

		var mockBanners = [
			{
				//name: '',
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


		CategoryType
			.get()
			.then(function(data) {
				logger.debug("CategoryType.get() ...");
				resolve(params);
			})
			.catch(function(error) {
				reject(error);
			})

		
	});  	

};

module.exports = IndexModel;