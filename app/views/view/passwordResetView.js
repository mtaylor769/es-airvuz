var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.view.passwordResetView');

try {
  var BaseView					= require('./baseView');
  var PasswordResetModel= require('../model/passwordResetModel');
  var util							= require('util');

  if(global.NODE_ENV === "production") {
    logger.setLevel("WARN");
  }
}
catch(exception) {
  logger.error(" import error:" + exception);
}

var IndexView = function(params) {
  BaseView.apply(this, arguments);

  this.model = new PasswordResetModel();
};

util.inherits(IndexView, BaseView);

module.exports = new IndexView({
  cacheTimeout	: 0,
  viewName			: 'app.views.view.passwordReset',
  viewPath			: './app/views/view/template/passwordReset.dust',
  partials			: [
    {
      partialName: 'app.views.view.partial.css',
      partialPath: './app/views/view/partial/css.dust'
    },
    {
      partialName: 'app.views.view.partial.js',
      partialPath: 'app/views/view/partial/js.dust'
    },
    {
      partialName: 'app.views.view.partial.cdn-js',
      partialPath: './app/views/view/partial/cdn-js.dust'
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