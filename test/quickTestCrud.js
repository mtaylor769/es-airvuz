require("../mongoose");

var log4js				= require('log4js');
var logger				= log4js.getLogger("test.quickTestCrud");


var Videos			= require('../app/persistence/crud/videos');


	Videos.create({
		//sessionId			: "sessionId" + new Date(),
		userId				: "GUEST",
		userAclRoles	: {},
		//title					: "Title of video",
		description		: "Description of video",
		duration			: "2:30",
		videoPath			: "path to video",
		thumbnailPath	: "path to thumbnail"
	})
	.then(function() {
		logger.debug("Videos.create: .then");
	})
	.catch(function(error) {
		logger.debug("Videos.create: .error" + JSON.stringify(error, null, 2));
	})



	
	
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