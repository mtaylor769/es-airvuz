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

    // store to mongo
    var autoView = new AutoViewModel( params );
    autoView.save( function (err) { if (err) { logger.info (err) } } );
    return autoViewModel;
}

/* User-supplied parameters */
AutoView.prototype.autoCreate = function (params) {
    var newParams = {};
    newParams.videoId = params.videoId;
    // set random initial conditions
    newParams.numberOfDays = getRandomInt(7, 14);
    newParams.numberOfViews = getRandomInt(25, 50);
    newParams.probability = getRandom(.2, .8);

    var autoView = this.create(newParams);

    return autoView;
}

/* Automatic randomized parameters
* params.daysAhead = number of "days ahead" to add when computing current time/date (for testing cron job)
*/
AutoView.prototype.applyAutoViews = function (params){
    var autoViews = AutoViewModel.find({ isComplete: false }).exec();

    return autoViews.then ( function (avResult){
        // resolved
        var daysAhead = params.daysAhead;
        var aryLen = avResult.length;
        var aryLen2;
        var indexOuter;
        var indexInner;
        var avTimeDates;
        var thisTimeDate;
        var timeNow = moment().add(daysAhead, 'days').valueOf();

        for (indexOuter=0; indexOuter< aryLen; indexOuter++) {
            indexInner = avResult[indexOuter].lastAddedTimeIndex + 1;

            avTimeDates = avResult[indexOuter].autoViewDateTime;
            aryLen2 = avTimeDates.length;

            for (indexInner; indexInner<aryLen2; indexInner++) {
                thisTimeDate = avTimeDates[indexInner];
                if (thisTimeDate <= timeNow) {
                    video.applyAutoView ( { videoId: avResult[indexOuter].videoId } );
                    if (indexInner == aryLen2 -1) {
                        updateAutoView({ id: avResult[indexOuter]._id, update: { lastAddedTimeIndex: indexInner, isComplete: true }});
                    } else {
                        updateAutoView({ id: avResult[indexOuter]._id, update: { lastAddedTimeIndex: indexInner }});
                    }
                } else {
                    continue;
                }
            }
        }


    }).catch(function (err){
        logger.error (err);
    });
}


// Internal functions ////////////////////////////////////////////////

var updateAutoView = function (params) {

    AutoViewModel.findByIdAndUpdate(params.id, params.update ).then(function (updateResult) {
        // resolved
    }, function (avResult){
        // rejected
    }).catch (function (err){
        logger.error (err);
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