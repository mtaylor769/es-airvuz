// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.view.baseView');

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

var IndexModel = function(params) {
	logger.debug("constructor: IN");	
	
	BaseModel.apply(this, arguments);
}

var BaseView = function(params) {
	params												= params || {};
	this.viewConfig								= params;
	this.model										= null;
	this.cacheTimeout							= this.viewConfig.cacheTimeout || -1;
  this.lastRenderViewTime				= -1;
  this.cachedView								= "";
}

BaseView.prototype.getViewConfig = function() {
	return(this.viewConfig);
}

BaseView.prototype.getModel = function(params) {
	var THIS = this;
	return new Promise(function(resolve, reject) {
		THIS.model.getData(params)
			.then(function(data) {
				resolve(data);
		});
	})
}

BaseView.prototype.getViewName = function() {
	return(this.viewConfig.viewName);
}


module.exports = BaseView;