var log4js					= require('log4js');
var logger					= log4js.getLogger('app.views.model.category');


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

	var promise = Promise.all([CategoryType.get(), Videos.get5Videos(12)])
			.then(function(data) {
				params.data.category = params.request.params.category;
				params.data.categories = data[0];
				params.data.videos = data[1];
				return params;
			});

	return Promise.resolve(promise);
};

module.exports = CategoryModel;