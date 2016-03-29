// IMPORT: BEGIN
	var log4js		= require('log4js');
	var logger		= log4js.getLogger('app.views.data.index');
	
	try {
		var Promise		= require('bluebird');

		if(global.NODE_ENV === "production") {
			logger.setLevel("WARN");	
		}

		logger.info("import complete");	
	}
	catch(exception) {
		logger.error(" import error:" + exception);
	}
// IMPORT: END

var Index = function() {
	logger.debug("constructor: IN");	
	
	this.viewConfig = {
		cacheTimeout	: 5,
		viewName			: 'app.views.index.dust',
		viewPath			: './app/views/index.dust',
		partials			: []
	}
}

Index.prototype.getData = function(params) {	
	params.viewName							= "app.views.index.dust";
	params.data									= {};
	params.data.index						= {};
	params.data.index.viewName	= "Index PageV2";
	
	return(params);
}

Index.prototype.getViewConfig = function() {
	return(this.viewConfig);
}


module.exports = new Index();