var log4js					= require('log4js');
var logger					= log4js.getLogger('app.views.model.search');


try {
	var BaseModel	    = require('./baseModel');
	var Promise		    = require('bluebird');
	var util			    = require('util');
	var Videos     = require('../../persistence/crud/videos');
	var CategoryType	= require('../../../app/persistence/crud/categoryType');

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

	var sourceManifest	= params.sourceManifest;

	params.data							= {};
	params.data.title				= "AirVūz – Search";
	params.data.airvuz			= {};
	params.data.airvuz.css	= sourceManifest["airvuz.css"];
	params.data.airvuz.js   = sourceManifest["airvuz.js"];
	params.data.vendor      = {};
	params.data.vendor.js   = sourceManifest["vendor.js"];
	params.data.viewName		= "Search";

	var promise = Promise.all([CategoryType.get(), Videos.get5Videos()])
			.then(function(data) {
				params.data.categories = data[0];
				params.data.videos = data[1].concat(data[1]);
				return params;
			});

	return Promise.resolve(promise);
};

module.exports = SearchModel;