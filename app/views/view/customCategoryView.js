var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.view.categoryView');

try {
    var BaseView					    = require('./baseView');
    var CustomCategoryModel				= require('../model/customCategoryModel');
    var util							= require('util');

    if(global.NODE_ENV === "production") {
        logger.setLevel("WARN");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}

var CustomCategoryView = function(params) {
    BaseView.apply(this, arguments);
    this.model = new CustomCategoryModel();
};

util.inherits(CustomCategoryView, BaseView);

module.exports = new CustomCategoryView({
    cacheTimeout	: 0,
    viewName			: 'app.views.view.template.customCategory',
    viewPath			: './app/views/view/template/customCategory.dust',
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
        },
        {
            partialName: 'app.views.view.partial.left-nav',
            partialPath: './app/views/view/partial/left-nav.dust'
        },
        {
            partialName: 'client.templates.core.video-display',
            partialPath: './client/templates/core/video-display.dust'
        }
    ]
});