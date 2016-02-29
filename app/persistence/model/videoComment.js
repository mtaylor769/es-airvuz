var mongoose = require('mongoose');

var videoCommentSchema = mongoose.Schema({

	/*
	 * The comment.
	 */
	comment : {
		required	: true,
		type			: String
	},

	/*
	 * When the comment was created.
	 */
	commentCreatedDate : {
		default: Date.now,
		type: Date
	},

	/*
	 * Identifies if the comment is visible.
	 */
	isVisible: {
		required	: true,
		type			: Boolean
	},

	/*
	 * The userId of the person who made the comment.
	 */
	userId : {
		type: mongoose.Schema.ObjectId, ref: 'User'
	}

});

mongoose.model('VideoComment', videoCommentSchema);