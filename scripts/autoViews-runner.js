// Run AutoViews

try {
    var log4js = require('log4js');
    var logger = log4js.getLogger('scripts.autoViews-runner.js');
    var moment = require('moment');
    var AutoView        = require('../app/persistence/crud/autoView1-0-0');

//    var testAutoViewId = '583327ec6d7da89016608ed9';

    logger.info("begin");

    AutoView.applyAutoViews();

    logger.info ('done');
}
catch (error) {
    console.log("error: " + error);
    var noop = null;
}


