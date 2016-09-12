// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.view.notificationView');

try {
  var BaseView					= require('./baseView');
  var NotificationModel	= require('../model/notificationModel');
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

  this.model = new NotificationModel();
}

util.inherits(IndexView, BaseView);

module.exports = new IndexView({
  cacheTimeout	: 0,
  viewName			: 'app.views.view.notification',
  viewPath			: './app/views/view/template/notification.dust',
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
    }
  ]
});