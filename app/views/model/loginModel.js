// IMPORT: BEGIN
var log4js    = require('log4js');
var logger    = log4js.getLogger('app.views.model.login');

try {
  var BaseModel = require('./baseModel');
  var Promise   = require('bluebird');
  var util      = require('util');

  if(global.NODE_ENV === "production") {
    logger.setLevel("WARN");  
  }

  logger.info("import complete"); 
}
catch(exception) {
  logger.error(" import error:" + exception);
}
// IMPORT: END

var LoginModel = function(params) {
  logger.debug("constructor: IN");  
  
  BaseModel.apply(this, arguments);
}

util.inherits(LoginModel, BaseModel);

LoginModel.prototype.getData = function(params) { 
  logger.info("getData ");  
  var sourceManifest  = params.sourceManifest;
  var THIS            = this;
  return new Promise(function(resolve, reject) {
    logger.info("getData 1.0");
    logger.info("getData sourceManifest['airvuz.css']:" + sourceManifest["airvuz.css"]);
    params.data                   = {};
    
    params.data.airvuz      = {};
    params.data.airvuz.css  = sourceManifest["airvuz.css"];
    params.data.airvuz.js   = sourceManifest["airvuz.js"];
    params.data.vendor      = {};
    params.data.vendor.js   = sourceManifest["vendor.js"];

    params.data.login             = {};
    params.data.login.airvuz      = {};
    params.data.login.airvuz.css  = sourceManifest["airvuz.css"];
    params.data.login.viewName    = "Login Test";

    params.data.login.head        = {};
    // params.data.login.head.og     = config.view.index.og;
    params.data.login.head.title  = "AirVūz – Drone Video Community"
    params.data.login.viewName    = "index";  

    resolve(params);
  });   

}

module.exports = LoginModel;