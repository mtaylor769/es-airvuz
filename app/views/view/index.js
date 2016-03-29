// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.data.index');

try {
	var BaseView	= require('./baseView');
	var Promise		= require('bluebird');
	var util			= require('util');

	if(global.NODE_ENV === "production") {
		logger.setLevel("WARN");	
	}

	logger.info("import complete");	
}
catch(exception) {
	logger.error(" import error:" + exception);
}
// IMPORT: END

var Index = function(params) {
	logger.debug("constructor: IN");	
	
	BaseView.apply(this, arguments);
}

util.inherits(Index, BaseView);

Index.prototype.getData = function(params) {	
	logger.info("getData ");	
	var sourceManifest	= params.sourceManifest;
	var THIS						= this;
	return new Promise(function(resolve, reject) {
		logger.info("getData 1.0");
		logger.info("getData sourceManifest['airvuz.css']:" + sourceManifest["airvuz.css"]);
		//logger.info("getData sourceManifest.airvuz.css:" + sourceManifest.airvuz.css);
		params.viewName								= THIS.viewConfig.viewName;
		params.data										= {};
		params.data.airvuz						= {};
		
		params.data.index							= {};
		params.data.index.airvuz			= {};
		params.data.index.airvuz.css	= sourceManifest["airvuz.css"];
		params.data.index.viewName		= "Index PageV2";		
		
		//throw("Something went bad");
		//reject("Something went bad");
		logger.info("getData 2.0");
		resolve(params);

	});  	

}

/*
Index.prototype.getViewConfig = function() {
	return(this.viewConfig);
}

Index.prototype.getViewName = function() {
	return(this.viewConfig.viewName);
}
*/

module.exports = new Index({
		cacheTimeout	: 5,
		viewName			: 'app.views.index.dust',
		viewPath			: './app/views/index.dust',
		partials			: []
	});