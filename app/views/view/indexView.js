// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.view.indexView');

try {
	var BaseView		= require('./baseView');
	var IndexModel	= require('../model/indexModel');
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
		viewPath			: './app/views/view/template/index.dust',
		partials			: [
			{
				partialName: 'app.views.view.partial.js',
				partialPath: './app/views/view/partial/js.dust' 
			},
			{
				partialName: 'app.views.view.partial.header',
				partialPath: './app/views/view/partial/header.dust' 
			},
			{
				partialName: 'app.views.view.partial.footer',
				partialPath: './app/views/view/partial/footer.dust' 
			},
			{
				partialName: 'client.templates.home.home-video',
				partialPath: './client/templates/home/home-video.dust'
			},
			{
				partialName: 'app.views.view.partial.left-nav',
				partialPath: './app/views/view/partial/left-nav.dust'
			}
		]
	});