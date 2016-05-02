var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.view.staticView');

try {
	var BaseView					= require('./baseView');
	var StaticModel				= require('../model/staticModel');
	var util							= require('util');

	if(global.NODE_ENV === "production") {
		logger.setLevel("WARN");
	}
}
catch(exception) {
	logger.error(" import error:" + exception);
}

var StaticView = function(params) {
	BaseView.apply(this, arguments);
	
	this.model = new StaticModel();
};

util.inherits(StaticView, BaseView);

module.exports = function (staticPage) {
	return new StaticView({
		cacheTimeout	: 5,
		viewName			: staticPage,
		viewPath			: './app/views/view/template/static.dust',
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
				partialName: 'app.views.view.partial.' + staticPage,
				partialPath: './app/views/view/partial/' + staticPage + '-static.dust'
			}
		]
	});
};