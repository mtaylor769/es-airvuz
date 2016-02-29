var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var curatedVideosSchema = mongoose.Schema({

	/*
	 * @type {string}
	 */
	curatedType : {
		required	: true,
		type			: String,
		default		: ['FAVORITE', 'FEATURED', 'STAFF_PICK']
	},
	
	videoId: {
		required : true,
		type: mongoose.Schema.Types.ObjectId, ref: 'Video' 
	},
	
	viewIndex		: {
		required	: true,
		type			: Number
	}

});

mongoose.model('CuratedVideos', curatedVideosSchema);

