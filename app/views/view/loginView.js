// IMPORT: BEGIN
var log4js    = require('log4js');
var logger    = log4js.getLogger('app.views.view.loginView');

try {
  var BaseView    = require('./baseView');
  var LoginModel  = require('../model/loginModel');
  var Promise     = require('bluebird');
  var util        = require('util');

  if(global.NODE_ENV === "production") {
    logger.setLevel("WARN");  
  }

  logger.info("import complete"); 
}
catch(exception) {
  logger.error(" import error:" + exception);
}
// IMPORT: END

var LoginView = function(params) {
  logger.debug("constructor: IN");  
  BaseView.apply(this, arguments);
  
  this.model = new LoginModel();
}

util.inherits(LoginView, BaseView);

module.exports = new LoginView({
    cacheTimeout  : 5,
    viewName      : 'app.views.view.template.login.dust',
    viewPath      : './app/views/view/template/login.dust',
    partials      : [
      {
        partialName: 'app.views.view.partial.header',
        partialPath: './app/views/view/partial/header.dust' 
      },
      {
        partialName: 'app.views.view.partial.footer',
        partialPath: './app/views/view/partial/footer.dust' 
      } 
    ]
  });