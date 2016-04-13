// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.view.videoUploadView');

try {
	var BaseView					= require('./baseView');
	var VideoUploadModel	= require('../model/videoUploadModel');
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
	
	this.model = new VideoUploadModel();
}

util.inherits(IndexView, BaseView);

module.exports = new IndexView({
		cacheTimeout	: 5,
		viewName			: 'app.views.view.template.videoUpload',
		viewPath			: './app/views/view/template/videoUpload.dust',
		partials			: [
			{
				partialName: 'app.views.view.partial.css',
				partialPath: './app/views/view/partial/css.dust'
			},
			{
				partialName: 'app.views.view.partial.js',
				partialPath: 'app/views/view/partial/js.dust'
			},
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