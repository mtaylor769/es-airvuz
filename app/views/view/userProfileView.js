// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.view.userProfileView');

try {
	var BaseView					= require('./baseView');
	var UserProfileModel	= require('../model/userProfileModel');
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
	
	this.model = new UserProfileModel();
};

util.inherits(IndexView, BaseView);

module.exports = new IndexView({
		cacheTimeout	: 5,
		viewName			: 'app.views.view.userProfile',
		viewPath			: './app/views/view/template/userProfile.dust',
		partials			: [
			{
				partialName: 'app.views.view.partial.header',
				partialPath: './app/views/view/partial/header.dust' 
			},
			{
				partialName: 'app.views.view.partial.footer',
				partialPath: './app/views/view/partial/footer.dust' 
			},
			{
				partialName: 'client.templates.userProfile.showcase-user',
				partialPath: './client/templates/userProfile/showcase-user.dust'
			},
			{
				partialName: 'client.templates.userProfile.showcase-owner',
				partialPath: './client/templates/userProfile/showcase-owner.dust'
			},
			{
				partialName: 'client.templates.userProfile.allvideos-user',
				partialPath: './client/templates/userProfile/allvideos-user.dust'
			},
			{
				partialName: 'client.templates.userProfile.allvideos-owner',
				partialPath: './client/templates/userProfile/allvideos-owner.dust'
			}
		]
	});