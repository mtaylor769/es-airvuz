// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.data.index');

try {
	var BaseView					= require('./baseView');
	var VideoPlayerModel	= require('../model/videoPlayerModel');
	var Promise						= require('bluebird');
	var util							= require('util');

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
	
	this.model = new VideoPlayerModel();
}

util.inherits(IndexView, BaseView);

module.exports = new IndexView({
		cacheTimeout	: 5,
		viewName			: 'app.views.view.videoPlayer',
		viewPath			: './app/views/view/template/videoPlayer.dust',
		partials			: [
			{
				partialName: 'app.views.view.partial.header',
				partialPath: './app/views/view/partial/header.dust' 
			},
			{
				partialName: 'app.views.view.partial.footer',
				partialPath: './app/views/view/partial/footer.dust' 
			}	
		]
	});