// IMPORT: BEGIN
var log4js							= require('log4js');
var logger							= log4js.getLogger('app.views.model.index');

try {
	var BaseModel					= require('./baseModel');
	var Promise						= require('bluebird');
	var util							= require('util');
	var usersCrud					= require('../../persistence/crud/users');
	var videoCrud					= require('../../persistence/crud/videos');
	var sourceManifest 		= null;
	var THIS 							= null;
	var userProfile 			= null;
	var dataObject 				= {};

	if(global.NODE_ENV === "production") {
		logger.setLevel("WARN");	
	}

	logger.info("import complete");	
}
catch(exception) {
	logger.error(" import error:" + exception);
}
// IMPORT: END

var UserProfileModel = function(params) {
	logger.debug("constructor: IN");	
	
	BaseModel.apply(this, arguments);
};

util.inherits(UserProfileModel, BaseModel);

UserProfileModel.prototype.getData = function(params) {	
	logger.info("getData ");	
	sourceManifest	= params.sourceManifest;
	THIS						= this;
	//why is this getting ran twice?  Once as the parameter, another as 'public'
	// var userid 			= params.request.params.userid;
	var userid 			= '57153beddeb1e35295946a96';
	return usersCrud.getUserById(userid)
		.then(function(user){
			params.data 												= {};
			params.data.userProfile							= user;
			params.data.userProfile.title				= "User Profile";
			params.data.userProfile.airvuz			= {};
			params.data.userProfile.airvuz.css	= sourceManifest["airvuz.css"];
			params.data.userProfile.viewName		= "User Profile";
			//videoCrud currently does not have ability to get videos based on userid
			return params;
		});
};

module.exports = UserProfileModel;