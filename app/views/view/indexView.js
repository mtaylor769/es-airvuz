// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.data.index');

try {
	var BaseView		= require('./baseView');
	var IndexModel	= require('../model/indexModel');
	var Promise			= require('bluebird');
	var util				= require('util');

	if(global.NODE_ENV === "production") {
		logger.setLevel("WARN");	
	}

	logger.info("import complete");	
}
catch(exception) {
	logger.error(" import error:" + exception);
}
// IMPORT: END

var IndexView = function(params) {
	logger.debug("constructor: IN");	
	BaseView.apply(this, arguments);
	
	this.model = new IndexModel();
}

util.inherits(IndexView, BaseView);

module.exports = new IndexView({
		cacheTimeout	: 5,
		viewName			: 'app.views.index.dust',
		viewPath			: './app/views/index.dust',
		partials			: [
			{
				partialName: 'app.views.view.partials.header',
				partialPath: './app/views/view/partials/header.dust' 
			}			
		]
	});