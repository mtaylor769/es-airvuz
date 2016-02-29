var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var curatedVideosSchema = mongoose.Schema({

	/*
	 * @type {string}
	 */
	curatedType : {
		required	: true,
		type			: String,
		default		: ['FEATURED', 'STAFF_PICK']
	},
	
	videoId: {
		required : true,
		type: mongoose.Schema.Types.ObjectId, ref: 'Video' 
	},
	
	viewOrder		: {
		required	: true,
		type			: Number
	}

});

mongoose.model('CuratedVideos', curatedVideosSchema);

