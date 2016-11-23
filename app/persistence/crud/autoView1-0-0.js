console.log("begin");

var namespace = 'app.persistence.crud.autoView1-0-0';

// requires: sudo npm install --save probability-distributions

try {
    var Promise = require('bluebird');
    var PD = require("probability-distributions");
    var log4js = require('log4js');
    var logger = log4js.getLogger('app.persistence.crud.autoView1-0-0.js');
    var moment = require('moment');
    var database = require('../database/database');

    AutoViewModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.autoView"});
    VideoModel 	= database.getModelByDotPath({modelDotPath: "app.persistence.model.videos"});

    var video      = require('../../persistence/crud/videos1-0-0');
}
catch (error) {
    console.log("error: " + error);
}

/**
 *
 added to video model: autoViewCount
 */

var AutoView = function () {}

AutoView.prototype.create = function (params) {
    var numberOfDays = params.numberOfDays;
    var numberOfViews = params.numberOfViews;
    var probability = params.probability;
    var videoId = params.videoId;

    var rbinom_0 = PD.rbinom(numberOfViews, numberOfDays, probability);

// turn distribution into views per day.
    var dist = ToViewsPerDay({
        numberOfDays: numberOfDays,
        data: rbinom_0
    });

// Get a list of timestamps for views.
    var thisDate = moment().valueOf();        // Time begins now

    var timestamps = getTimestamps({
        dateBegin: thisDate,
        dist: dist
    });

    params.autoViewDateTime = timestamps;

    // store to mongo collections
    var autoViewModel = new AutoViewModel( params );
    autoViewModel.save( function (err) { if (err) { logger.info (err) } } );
    return autoViewModel;
}

AutoView.prototype.autoCreate = function (params) {
    var newParams = {};
    newParams.videoId = params.videoId;
    // set random initial conditions
    newParams.numberOfDays = getRandomInt(7, 14);
    newParams.numberOfViews = getRandomInt(5, 40);
    newParams.probability = getRandom(.2, .8);

    var autoView = this.create(newParams);

    return autoView;
}

AutoView.prototype.updateAutoViews = function (){
    var timeNow = moment().valueOf();
    var avArray = [];  // array of autoViews to be processed

    var autoViews = AutoViewModel.find({ isComplete: false }).exec();

    autoViews.then ( function (avResult){
        // resolved
        logger.info (avResult);
        var aryLen = avResult.length;
        var aryLen2;
        var i;
        var i2;
        var avTimeDates;
        var activeTimeDates = [];
        var videoId;
        var thisTimeDate;
        var timeNow = moment().valueOf();
        var lastIndex;

        for (i=0; i< aryLen; i++) {
            logger.info ('Processing record ' + i + ' of ' + aryLen);
            i2 = avResult[i].lastAddedTimeIndex + 1;

            avTimeDates = avResult[i].autoViewDateTime;
            aryLen2 = avTimeDates.length;

            for (i2; i2<aryLen2; i2++) {
                thisTimeDate = avTimeDates[i2];
                if (thisTimeDate <= timeNow) {
                    activeTimeDates.push (getVideo (avResult[i].videoId));
                   var noop;
                } else {
                    continue;
                }
            }

            /*
            thisTimeDate = aryTimeDate[i];
            logger.info ('TIMES:');
            logger.info (thisTimeDate);
            logger.info (timeNow);
            if (thisTimeDate <= timeNow ) {
                addAvParams.videoId = obj.videoId;
                addAvParams.viewCount = params.viewCount;
                addAutoView (addAvParams);
            } else {
                break;
            }

            */
        }

        /*
        aryLen = avArray.length;
        for (i=0; i< aryLen; i++) {
            logger.info ('Processing record ' + i + ' of ' + aryLen);
            avArray.push ( getVideo (avResult[i].videoId) );
        }
*/

        logger.info (activeTimeDates.length);

        Promise.each(activeTimeDates, function(result) {
            //logger.info(result);
            videoId = result._id;
            logger.info (videoId);
            video.applyAutoView ( { videoId: videoId } );
            var noop;
        });

    }).catch(function (err){
        logger.error (err);
    });
}


// Internal functions ////////////////////////////////////////////////

var getIncompleteAutoViews = function () {
    // return promise of query for all AutoViews which are not complete
    return AutoViewModel.find({ isComplete: false }).exec();
}

var getVideo = function (id) {
    return VideoModel.findById({ _id: id});
}

var updateVideo = function (params) {
    VideoModel.findByIdAndUpdate(params.id, params.update ).then(function (updateResult) {
        // resolved
        logger.info (updateResult.viewCount);

        var noop;

    }, function (avResult){
        // rejected
        var noop = null;
    }).catch (function (err){
        logger.error (err);
        // resolve (function (err) {  })
        //return { status: 'error', error: err }
    });

}

var getAutoView = function (id) {
    return AutoViewModel.findById ({_id: id}).exec();
}

var fooGetAutoView = function (id){
    // TODO refactor
    var autoViewId = params.autoViewId;
    var avPromise = getAutoView ( autoViewId );

    avPromise.then(function (avResult) {
        // resolved
        logger.info (avResult);
        var noop = null;

    }, function (avResult){
        // rejected
        var noop = null;
    }).catch (function (err){
        logger.error (err);
        resolve (function (err) {  })
        //return { status: 'error', error: err }
    });

}

var ToViewsPerDay = function (params) {
    var numberOfDays = params.numberOfDays;
    var data = params.data;
    var dayIndex = 0;
    var index = 0;
    var size = data.length;
    var item = 0;
    var distribution = [];

    for (index = 0; index < numberOfDays; index++) {
        distribution[index] = 0;
    }

    for (index = 0; index < size; index++) {
        dayIndex = data[index];

        if (typeof(distribution[dayIndex]) !== "undefined") {
            distribution[dayIndex]++;
        }
    }

    return (distribution);
}


var getTimestamps = function (params) {
    var theDate = params.dateBegin;

    logger.info ('THE DATE:');
    logger.info (theDate);

    var dist = params.dist;
    var distLen = dist.length;
    var millisecPerDay = 86400000;  // number of milliseconds per day
    var numViews = 0;
    var index = 0;
    var index2 = 0;
    var timestamps = [];        // fill and return this array;

    for (index = 0; index < distLen; index++) {
        numViews = dist[index];

        if (numViews === 0) {
            theDate = moment (theDate).add(1, 'days');
            continue;
        }

        millisecUnits = parseInt(millisecPerDay / numViews);  // Units of time per day, one view per unit

        for (index2 = 0; index2 < numViews; index2++) {
            logger.info ('THE DATE 2:');
            logger.info (theDate);
            timestamps.push(theDate + index2 * millisecUnits);
        }

        theDate = moment(theDate).add(1, 'days');
    }
    return (timestamps);
}


/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


module.exports = new AutoView();