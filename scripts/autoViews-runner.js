// Run AutoViews:  process all AutoView records which are not complete
// This is a test script for running manual operations

try {
    var log4js = require('log4js');
    var logger = log4js.getLogger('scripts.autoViews-runner.js');
    var moment = require('moment');
    var AutoView        = require('../app/persistence/crud/autoView1-0-0');

    logger.info("begin");

    AutoView.applyAutoViews();

    logger.info ('done');
}
catch (error) {
    console.log("error: " + error);
    var noop = null;
}


