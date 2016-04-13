var mongoose = require('mongoose');

var videoViewSchema = mongoose.Schema({

	/*
	 * Date the video was viewed.
	 */
	createdDate: {
		default:	Date.now,
		type:			Date
	},
	
	/*
	 * Id of the video that was viewed.
	 */
	
	videoId : {
		type: mongoose.Schema.ObjectId, ref: 'Video'
	},

	/*
	 * The userId of the person who viewed the video.
	 */
	userId : {
		type: mongoose.Schema.ObjectId, ref: 'User'
	}
	
});

module.exports = {
	connectionName	: "main",
	modelName				: "VideoView",
	schema					: videoViewSchema
};