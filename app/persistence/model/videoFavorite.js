var mongoose = require('mongoose');

var videoFavoriteSchema = mongoose.Schema({

	/*
	 * Date the video was favorited.
	 */
	createdDate: {
		default:	Date.now,
		type:			Date
	},
	
	/*
	 * Id of the video that was favorited.
	 */
	
	videoId : {
		type: mongoose.Schema.ObjectId, ref: 'Video'
	},

	/*
	 * The userId of the person favorited the video.
	 */
	userId : {
		type: mongoose.Schema.ObjectId, ref: 'User'
	}
	
});

mongoose.model('VideoFavorite', videoFavoriteSchema);