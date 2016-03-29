// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.manager.view');

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

var View = function(params) {
	this.pageName = params.pageName;
	this.pagePath	= params.pagePath;
}



module.exports = View;