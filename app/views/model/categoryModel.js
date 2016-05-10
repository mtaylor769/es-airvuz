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

	var videoPromise;
	if (params.request.params.category === 'Featured Videos') {
		videoPromise = VideoCollection.getFeaturedVideos(12, 1);
	} else if (params.request.params.category === 'Staff Pick Videos') {
		videoPromise = VideoCollection.getStaffPickVideos(12, 1);
	} else {
		videoPromise = Videos.get5Videos(12);
	}
	var promise = Promise.all([CategoryType.get(), videoPromise])
			.then(function(data) {
				params.data.category = params.request.params.category;
				params.data.categories = data[0];
				params.data.videos = data[1];
				params.data.showLoadMore = data[1].length > 11;
				return params;
			});

	return Promise.resolve(promise);
};

module.exports = CategoryModel;