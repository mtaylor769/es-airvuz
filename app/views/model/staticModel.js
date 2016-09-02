var log4js					= require('log4js');
var logger					= log4js.getLogger('app.views.model.staticModel');

try {
	var BaseModel	    = require('./baseModel');
	var Promise		    = require('bluebird');
	var util			    = require('util');
	var CategoryType  = require('../../persistence/crud/categoryType');

	if(global.NODE_ENV === "production") {
		logger.setLevel("WARN");
	}
}
catch(exception) {
	logger.error(" import error:" + exception);
}

var StaticModel = function(params) {
	BaseModel.apply(this, arguments);
};

util.inherits(StaticModel, BaseModel);

StaticModel.prototype.getData = function(params) {
	var staticView = params.request.path.replace('/', '');
	params.data							= {};
	params.data.title				= "AirVūz - " + staticView;
	params.data.viewName		= staticView;
	params.data.staticPage  = staticView;

	var promise = CategoryType.get()
			.then(function (categories) {
				params.data.categories = categories;
				return params;
			});

	return Promise.resolve(promise);
};

module.exports = StaticModel;