console.log("begin");

var namespace = 'app.persistence.crud.autoView1-0-0';

// requires: sudo npm install --save probability-distributions

try {
    var PD = require("probability-distributions");
    var log4js = require('log4js');
    var logger = log4js.getLogger('app.persistence.crud.autoView1-0-0.js');
    var moment = require('moment');
    var database = require('../database/database');

    AutoViewModel = database.getModelByDotPath({modelDotPath: "app.persistence.model.autoView"});

}
catch (error) {
    console.log("error: " + error);
}

/**
 *
 * Data Model for collection : autoviews:
 videoId:
 numberOfViewsToAdd        : number
 distributionCurve        : spike, longtail
 viewAddDateTime        : []  // this is an array date/times when the view is to be added.
 lastAddedTimeIndex     : index of the last view added  from the date/time distributeion array.
 lastViewAddedDateTime    : date
 isComplete                : boolean

 added to video model: autoViewCount
 */

var AutoView = function () {}

AutoView.prototype.create = function (params) {
    var numberOfDays = params.numberOfDays;
    var numberOfViews = params.numberOfViews;
    var probability = params.probability;
    var videoId = params.videoId;

    // store to mongo collections
    var autoViewModel = new AutoViewModel( params );
    return autoViewModel.save();
}

AutoView.prototype.autoCreate = function (params) {
    var newParams = {};
    newParams.videoId = params.videoId;
    // set random initial conditions
    newParams.numberOfDays = getRandomInt(7, 14);
    newParams.numberOfViews = getRandomInt(5, 40);
    newParams.probability = getRandom(.2, .8);

    var autoView = this.create(newParams);

}

AutoView.prototype.runAutoViews = function (params) {
    var autoViewId = params.autoViewId;

    // if isComplete true, no further action

    // most recently implemented autoview

    // while remaining autoviews have date less than now, implement autoview

    // if all autoviews added, set isComplete to true.
}


// Internal functions ////////////////////////////////////////////////

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
            theDate = theDate.add(1, 'days');
            continue;
        }

        millisecUnits = parseInt(millisecPerDay / numViews);  // Units of time per day, one view per unit

        for (index2 = 0; index2 < numViews; index2++) {
            timestamps.push(theDate + index2 * millisecUnits);
        }

        theDate = theDate.add(1, 'days');

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


// Miscellaneous TODO: delete //////////////////////////////////////////////////////

// Get a distribution
var numOfDays = 14;
var numOfViews = 200;
var probability = 0.5;  // 0.2 is front loaded, 0.5 is mid, 0.8 is tail loaded

var rbinom_0 = PD.rbinom(numOfViews, numOfDays, probability);

// turn distribution into views per day.
var dist = ToViewsPerDay({
    numberOfDays: numOfDays,
    data: rbinom_0
});


// Get a list of timestamps for views.
var thisDate = moment();        // Time begins now

var timestamps = getTimestamps({
    dateBegin: thisDate,
    dist: dist
});


// TEST ///////////////////////////////////////////////////////////////

var autoView = AutoView.prototype.autoCreate({videoId: '12345'});
logger.info ('AutoView:');
logger.info (autoView);
var noop = "";

module.exports = new AutoView();