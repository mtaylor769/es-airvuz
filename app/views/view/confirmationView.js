var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.view.confirmationView');

try {
    var BaseView					= require('./baseView');
    var ConfirmationModel           = require('../model/confirmationModel');
    var util						= require('util');

    if(global.NODE_ENV === "production") {
        logger.setLevel("WARN");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}

var ConfirmationView = function(params) {
    BaseView.apply(this, arguments);

    this.model = new ConfirmationModel();
};

util.inherits(ConfirmationView, BaseView);

module.exports = new ConfirmationView({
    cacheTimeout	    : 0,
    viewName			: 'app.views.view.confirmation',
    viewPath			: './app/views/view/template/confirmation.dust',
    partials			: []
});