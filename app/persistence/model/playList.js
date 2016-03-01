var mongoose = require('mongoose');

var playListSchema = mongoose.Schema({
	
	playListName: {
		required	: true,
		type			: String
	},
	
	userId: {
		ref				: 'User',
		required	: true,
		type			: mongoose.Schema.ObjectId	
	},
	
	videoList: [{
			videoId : {
				required : true,
				type: mongoose.Schema.Types.ObjectId, ref: 'Video' 				
			},
			
			viewOrder : {
				required	: true,
				type			: Number
			}
	}]

});

mongoose.model('PlayList', playListSchema);