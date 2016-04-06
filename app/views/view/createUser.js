// IMPORT: BEGIN
var log4js    = require('log4js');
var logger    = log4js.getLogger('app.views.data.login');

try {
  var BaseView    = require('./baseView');
  var CreateUserModel  = require('../model/createUserModel');
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

var CreateUserView = function(params) {
  logger.debug("constructor: IN");  
  BaseView.apply(this, arguments);
  
  this.model = new CreateUserModel();
}

util.inherits(CreateUserView, BaseView);

module.exports = new CreateUserView({
    cacheTimeout  : 5,
    viewName      : 'app.views.view.template.createUser.dust',
    viewPath      : './app/views/view/template/createUser.dust',
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