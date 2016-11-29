var mongoose = require('mongoose');

/**
 *
 * Data Model for collection : autoView:
 videoId:
 numberOfViewsToAdd        : number
 distributionCurve        : spike, longtail
 viewAddDateTime        : []  // this is an array date/times when the view is to be added.
 lastAddedTimeIndex     : index of the last view added from the date/time distribution array.
 lastViewAddedDateTime    : date
 isComplete                : boolean
 */

var autoViewSchema = mongoose.Schema({

    /*
     * Id of the video which receives the autoViews.
     */
    videoId : {
        type: mongoose.Schema.ObjectId, ref: 'Video'
    },

    /*
     * Number of autoViews
     */
    numberOfViews: {
        type: Number,
        default: 0
    },

    /*
     * Number of Days
     */
    numberOfDays: {
        type: Number,
        default: 0
    },


    /*
     * Probability distribution
     */
    probability: {
        type: Number,
        default: 0
    },

    /*
     * Array of date/times when an AutoView is to be added.
    */
    autoViewDateTime: {
        type: Array,
        default: []
    },

    /*
     * index of the last view added from the date/time distribution array
     */
    lastAddedTimeIndex: {
        type: Number,
        default: -1
    },

    /*
     * is process complete?  That is:  have all autoViews been added to Views?
     */
    isComplete: {
        type: Boolean,
        default: false
    },

    /* Where did the AutoView originate: system (automatic on video upload), or admin (manual assignment) ? */
    origin: {
        required	    : true,
        type			: String,
        enum			: ['system', 'admin'],
        default         : 'system'
    }

});

module.exports = {
    connectionName	        : "main",
    modelName				: "autoView",
    schema					: autoViewSchema
};