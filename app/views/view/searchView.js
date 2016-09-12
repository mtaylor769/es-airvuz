var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.view.searchView');

try {
	var BaseView					= require('./baseView');
	var SearchModel				= require('../model/searchModel');
	var util							= require('util');

	if(global.NODE_ENV === "production") {
		logger.setLevel("WARN");
	}
}
catch(exception) {
	logger.error(" import error:" + exception);
}

var SearchView = function(params) {
	BaseView.apply(this, arguments);
	
	this.model = new SearchModel();
};

util.inherits(SearchView, BaseView);

module.exports = new SearchView({
	cacheTimeout	: 0,
	viewName			: 'app.views.view.template.search',
	viewPath			: './app/views/view/template/search.dust',
	partials			: [
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
		},
		{
			partialName: 'client.templates.core.video-display',
			partialPath: './client/templates/core/video-display.dust'
		}
	]
});