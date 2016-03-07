//node ./test/app/quickTestCrud
require("../mongoose");


var log4js									= require('log4js');
var logger									= log4js.getLogger("test.quickTestCrud");

var PersistenceException		= require('../app/utils/exceptions/PersistenceException');
var ValidationException			= require('../app/utils/exceptions/ValidationException');
var Videos									= require('../app/persistence/crud/videos');


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