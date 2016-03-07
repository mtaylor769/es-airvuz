//node ./test/app/quickTestCrud
require("../mongoose");


var log4js									= require('log4js');
var logger									= log4js.getLogger("test.quickTestCrud");

var BaseException						= require('../app/utils/exceptions/BaseException');
var PersistenceException		= require('../app/utils/exceptions/PersistenceException');
var ValidationException			= require('../app/utils/exceptions/ValidationException');
var Videos									= require('../app/persistence/crud/videos');




var Response = function() {

}

Response.prototype.send = function(response) {
	logger.debug("response response:" + JSON.stringify(response, null, 2));
	if(response.error) {
		logger.debug("response error:" + JSON.stringify(response.error, null, 2));
	}
	else {
		logger.debug("response data:" + JSON.stringify(response.data, null, 2));
	}
}

response = new Response();

var VideoApiCreate = function(req, res) {
	try {
		var params = {};
		params.sessionId				=	req.query.sessionId || null;
		params.userId						= req.query.userId || null;
		params.userAclRoles			= req.query.userAclRoles || null;
		params.title						= req.query.title || null;
		params.description			= req.query.description || null;
		params.duration					= req.query.duration || 0;
		params.videoPath				= req.query.videoPath || null;
		params.thumbnailPath		= req.query.thumbnailPath	|| null;	

		Videos.create(params)
		.then(function(video) {
			var response = {};
			response.data = {};
			response.data.title = video.title;
			response.data.duration = video.duration;
			logger.debug("VideoApiCreate.then");
			res.send(response);
		})
		.catch(function(error) {

			if(error instanceof PersistenceException) {
				logger.debug("PersistenceException:" + JSON.stringify(error.getErrors(), null, 2));
			}

			if(error instanceof ValidationException) {
				logger.debug("ValidationException:" + JSON.stringify(error.getErrors(), null, 2));
			}

			if(error instanceof BaseException) {
				res.send(error.getResponse());
			}
			

		});		
		
	}
	catch(error) {
		
	}
}

var req = {};
req.query = {};
req.query.sessionId = "sessionId" + new Date();
req.query.userId				= "GUEST";
req.query.userAclRoles	= {};
req.query.title					= "Title of video";
//req.query.description		= "Description of video";
req.query.duration			= "2:30";
req.query.videoPath			= "path to video";
req.query.thumbnailPath	= "path to thumbnail";	

VideoApiCreate(req, response);


/*
	// FAIL
	Videos.create({
		sessionId			: "sessionId" + new Date(),
		userId				: "GUEST",
		userAclRoles	: {},
		title					: "Title of video",
		//description		: "Description of video",
		duration			: "2:30",
		videoPath			: "path to video",
		thumbnailPath	: "path to thumbnail"
	})
	.then(function() {
		logger.debug("Videos.create: .then");
	})
	.catch(function(error) {
		
		if(error instanceof PersistenceException) {
			logger.debug("PersistenceException:" + JSON.stringify(error.getErrors(), null, 2));
		}
		
		if(error instanceof ValidationException) {
			logger.debug("ValidationException:" + JSON.stringify(error.getErrors(), null, 2));
		}
		
		

	});
	
	// SUCCEED
	Videos.create({
		sessionId			: "sessionId" + new Date(),
		userId				: "GUEST",
		userAclRoles	: {},
		title					: "Title of video",
		description		: "Description of video",
		duration			: "2:30",
		videoPath			: "path to video",
		thumbnailPath	: "path to thumbnail"
	})
	.then(function() {
		logger.debug("Videos.create: .then");
	})
	.catch(function(error) {
		
		if(error instanceof PersistenceException) {
			logger.debug("PersistenceException:" + JSON.stringify(error.getErrors(), null, 2));
		}
		
		if(error instanceof ValidationException) {
			logger.debug("ValidationException:" + JSON.stringify(error.getErrors(), null, 2));
		}

	});	



	
	
	var preCondition = Videos.getPreCondition({ sourceLocation : "persistence.crud.Videos.create"});
	var validation = preCondition.validate({
		update				: true,
		//sessionId			: "sessionId" + new Date(),
		userId				: "GUEST",
		userAclRoles	: {},
		//title					: "Title of video",
		description		: "Description of video",
		duration			: "2:30",
		videoPath			: "path to video",
		thumbnailPath	: "path to thumbnail"
	});
	
	*/