var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.view.notFoundView');

try {
  var BaseView					= require('./baseView');
  var NotFoundModel= require('../model/notFoundModel');
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

  this.model = new NotFoundModel();
};

util.inherits(IndexView, BaseView);

module.exports = new IndexView({
  cacheTimeout	: 10,
  viewName			: 'app.views.view.notFound',
  viewPath			: './app/views/view/template/notFound.dust',
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