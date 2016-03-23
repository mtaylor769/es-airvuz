var mongoose = require('mongoose');

var videoCommentsSchema = mongoose.Schema({
	
	/*
	 * The initial comment
	 */
	comment : {
		ref : 'Comment',
		type: mongoose.Schema.ObjectId
	},

	/*
	 * The replies to the initial comment
	 */
	replies : [{
		type: mongoose.Schema.ObjectId, ref: 'VideoComment'
	}],

	videoId: {
		type: mongoose.Schema.ObjectId, ref: 'Video'
	}


});

mongoose.model('VideoComment', videoCommentsSchema);