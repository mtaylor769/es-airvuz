var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.view.categoryView');

try {
	var BaseView					= require('./baseView');
	var CategoryModel				= require('../model/categoryModel');
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
	
	this.model = new CategoryModel();
};

util.inherits(SearchView, BaseView);

module.exports = new SearchView({
	cacheTimeout	: 2,
	viewName			: 'app.views.view.template.category',
	viewPath			: './app/views/view/template/category.dust',
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
			partialName: 'app.views.view.partial.cdn-js',
			partialPath: 'app/views/view/partial/cdn-js.dust'
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
			partialName: 'app.views.view.partial.left-nav',
			partialPath: './app/views/view/partial/left-nav.dust'
		}
	]
});