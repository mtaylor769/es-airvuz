console.log("in");

// requires: sudo rpm install --save probability-distributions

try {
    var PD = require("probability-distributions");

    /**
     *
     * Data Model for collection : autoviews:
     videoId:
     numberOfViewsToAdd		: number
     distubutionCurve		: spike, longtail
     viewAddDateTime		: []  // this is an array date/times when the view is to be added.
     lastAddedTimeIndex     : index of the last view added  from the date/time distributeion array.
     lastViewAddedDateTime 	: date
     isComplete				: boolean

     */

    var ToViewsPerDay = function(params) {
        var numberOfDays    = params.numberOfDays;
        var data            = params.data;
        var dayIndex        = 0;
        var index           = 0;
        var size            = data.length;
        var item            = 0;
        var distribution    = [];

        for(index = 0; index < numberOfDays; index++) {
            distribution[index] = 0;
        }

        for(index = 0; index < size; index++) {
            dayIndex = data[index];

            if(typeof(distribution[dayIndex]) !== "undefined") {
                distribution[dayIndex]++;
            }

        }

        return(distribution);


    }

    // Get a distribution
    var numOfDays = 14;
    var numOfViews = 100;
    var probability = 0.2;  // 0.2 is front loaded, 0.5 is mid, 0.8 is tail loaded

    var rbinom_0 = PD.rbinom(numOfViews, numOfDays, 0.2);

    // turn distribution into views per day.
    var dist = ToViewsPerDay({
        numberOfDays    : numOfDays,
        data            : rbinom_0
    });

    // Get a list of timestamps for views.

    var noop = "";
}
catch (error) {
    console.log("error: " + error);
}