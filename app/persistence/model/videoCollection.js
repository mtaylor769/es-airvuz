var mongoose = require('mongoose');

/*
* This model is for user video collections, Staff Picks, Featured Videos, and custom home carousels.
 */

var videoCollectionSchema = mongoose.Schema({
  /*
  * the name of the collection ie: "Showcase"
  */
  name: {
    required: true,
    type: String
  },
  /*
   * cleaned up name in url friendly format ex: /{name-to-url-friendly-name}?id={urlId}
   */
  nameUrl: String,
  /*
   * shortId generated from shortId
   */
  urlId: String,
  /*
   * description for carousel video collection
   */
  description: String,
  /*
   * Video List Description
   */
  listDescription: String,
  /*
   * Banner image for custom category
   */
  displayImage: String,
  /*
   * Banner Video for custom category
   */
  displayVideo: String,
  /*
   * start date for carousel
   */
  startDate: Date,
  /*
   * end date for carousel
   */
  endDate: Date,
  /*
   * created date of carousel
   */
  createdDate: {
    type: Date,
    default: Date.now()
  },
  /*
   * user id of carousel creator. Primarily used for user profile showcase.
   */
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Users'
  },
  /*
   * Videos included in the collection
   */
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }]
});

module.exports = {
  connectionName: 'main',
  modelName: 'VideoCollection',
  schema: videoCollectionSchema
};