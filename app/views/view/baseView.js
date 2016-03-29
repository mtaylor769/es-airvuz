var BaseView = function(params) {
	params												= params || {};
	this.viewConfig								= params;
	
	this.cacheTimeout							= this.viewConfig.cacheTimeout || -1;
  this.lastRenderViewTime				= -1;
  this.cachedView								= "";
}

BaseView.prototype.getViewConfig = function() {
	return(this.viewConfig);
}

BaseView.prototype.getViewName = function() {
	return(this.viewConfig.viewName);
}


module.exports = BaseView;