var log4js					= require('log4js');
var logger					= log4js.getLogger('app.views.model.category');


try {
	var BaseModel	    = require('./baseModel');
	var Promise		    = require('bluebird');
	var util			    = require('util');
	var Videos     = require('../../persistence/crud/videos');
	var CategoryType	= require('../../../app/persistence/crud/categoryType');
	var VideoCollection	= require('../../../app/persistence/crud/videoCollection');

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

	var videoPromise,
			TOTAL_PER_PAGE = 16;

	params.data.category = {};

	videoPromise = CategoryType.getByUrl(params.request.params.category)
		.then(function (category) {
			params.data.category.uri = params.request.params.category;
			params.data.category.name = params.request.params.category;
			switch(params.request.params.category) {
				case 'Featured Videos':
					return VideoCollection.getFeaturedVideos(TOTAL_PER_PAGE, 1);
				case 'Staff Pick Videos':
					return VideoCollection.getStaffPickVideos(TOTAL_PER_PAGE, 1);
				case 'Recent Videos':
					return Videos.getRecentVideos(TOTAL_PER_PAGE, 1);
				case 'Trending Videos':
					return Videos.getTrendingVideos(TOTAL_PER_PAGE, 1);
				default:
					params.data.category.name = category.name;
					return Videos.getVideoByCategory(TOTAL_PER_PAGE, 1, category._id);
			}
		});


	var promise = Promise.all([CategoryType.get(), videoPromise])
			.then(function(data) {
				params.data.categories = data[0];
				params.data.videos = data[1];
				params.data.showLoadMore = data[1].length > 11;
				return params;
			});

	return Promise.resolve(promise);
};

module.exports = CategoryModel;