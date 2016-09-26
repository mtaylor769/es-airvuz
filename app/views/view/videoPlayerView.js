// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.view.videoPlayerView');

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
		cacheTimeout	: 0,
		viewName			: 'app.views.view.videoPlayer',
		viewPath			: './app/views/view/template/videoPlayer.dust',
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
				partialName: 'client.templates.videoPlayer.videoPlayerModal',
				partialPath: './client/templates/videoPlayer/videoPlayerModal.dust'
			},
			{
				partialName: 'client.templates.videoPlayer.comments',
				partialPath: './client/templates/videoPlayer/comments.dust'
			},
			{
				partialName: 'client.templates.videoPlayer.videoNextVideosPartial',
				partialPath: './client/templates/videoPlayer/videoNextVideosPartial.dust'
			},
			{
				partialName: 'client.templates.videoPlayer.videoUserSlickPartial',
				partialPath: './client/templates/videoPlayer/videoUserSlickPartial.dust'
			}
		]
	});