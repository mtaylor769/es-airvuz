var log4js				= require('log4js');
var logger				= log4js.getLogger('app.views.model.searchModel');

try {
	var BaseModel	    = require('./baseModel');
	var Promise		    = require('bluebird');
	var util			= require('util');
	var videoCrud1_0_0	= require('../../persistence/crud/videos1-0-0');
	var CategoryType	= require('../../../app/persistence/crud/categoryType');
	var amazonConfig    = require('../../config/amazon.config');

	if(global.NODE_ENV === "production") {
		logger.setLevel("WARN");
	}
}
catch(exception) {
	logger.error(" import error:" + exception);
}

var SearchModel = function(params) {
	BaseModel.apply(this, arguments);
};

util.inherits(SearchModel, BaseModel);

SearchModel.prototype.getData = function(params) {
	params.data							= {};
	params.data.title				= "AirVūz – Search";
	params.data.viewName		= "Search";
	params.data.searchKeyWord = params.request.query.q;
	params.data.currentPage = parseInt(params.request.query.page, 10) || 1;

	params.data.s3Bucket 					= amazonConfig.OUTPUT_BUCKET;

	return Promise.all([CategoryType.get(), videoCrud1_0_0.search(params.request.query.q, params.data.currentPage)])
		.spread(function(category, searchResult) {
			params.data.categories = category;
			params.data.videos = searchResult.videos;
			params.data.totalVideo = searchResult.totalVideo;
			params.data.showLoadMore = searchResult.totalVideo > 20;
			params.data.showCategory = true;

			return params;
		});
};

module.exports = SearchModel;