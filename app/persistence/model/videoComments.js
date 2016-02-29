var mongoose = require('mongoose');

var videoCommentsSchema = mongoose.Schema({

	comments : [{
		type: mongoose.Schema.ObjectId, ref: 'VideoComment'
	}],

	videoId: {
		type: mongoose.Schema.ObjectId, ref: 'Video'
	}


});

mongoose.model('CameraType', videoCommentsSchema);