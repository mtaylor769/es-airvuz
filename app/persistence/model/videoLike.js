var mongoose = require('mongoose');

var videoLikeSchema = mongoose.Schema({

	/*
	 * Date the video was liked.
	 */
	createdDate: {
		default:	Date.now,
		type:			Date
	},
	
	/*
	 * Id of the video that was liked
	 */
	
	videoId : {
		type: mongoose.Schema.ObjectId, ref: 'Video'
	},

	/*
	 * The userId of the person who liked the video.
	 */
	userId : {
		type: mongoose.Schema.ObjectId, ref: 'User'
	},

	videoOwnerId : {
		ref: 'Users',
		type: mongoose.Schema.ObjectId
	}
	
});

module.exports = {
	connectionName	: "main",
	modelName				: "VideoLike",
	schema					: videoLikeSchema
};