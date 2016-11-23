// Add an AutoView

try {
    var log4js = require('log4js');
    var logger = log4js.getLogger('scripts.autoViews-add.js');
    var moment = require('moment');
    var AutoView        = require('../app/persistence/crud/autoView1-0-0');

    logger.info("begin");

    var autoView = AutoView.autoCreate({videoId: '57f90a64c70b7073a289768e'});

    var autoViewId = autoView._id;
    logger.info ('ID: ' + autoViewId);

    logger.info ('done');
    // process.exit(0);
}
catch (error) {
    console.log("error: " + error);
    // process.exit(-1);
}
