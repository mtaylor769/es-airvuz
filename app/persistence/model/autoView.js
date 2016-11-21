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
    autoViewCount: {
        default: 0,
        type: Number
    },

    /*
     * Number of autoViews
     */
    distributionCurve: {
        type: Number
    },

    /*
     * Array date/times when the view is to be added.
    */
    autoViewAddDateTime: [],

    /*
     * index of the last view added from the date/time distribution array
     */
    lastAddedTimeIndex: {
        type: Number
    },

    /*
     *  timestamp of most recently added autoView
     *  TODO: don't need this?  get from  autoViewAddDateTime [lastAddedTimeIndex] ??
     */
    lastViewAddedDateTime: {
        type: Date
    },

    /*
     * is process complete?  That is:  have all autoViews been added to Views?
     */
    isComplete: {
        type: Boolean,
        default: false
    }

});

module.exports = {
    connectionName	        : "main",
    modelName				: "autoView",
    schema					: autoViewSchema
};