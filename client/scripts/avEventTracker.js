// Client Side
var AVEventTracker = function(params) {
	var params	= params || null;
	var data		= {};

	if(params !== null) {
		data.codeSource		= params.codeSource || "";
		data.eventName		= params.eventName || "";
		data.eventSource	= params.eventSource || "browser";
		data.eventType		= params.eventType	|| "";
		data.userId			= params.userId	|| null;
		data.eventMessage 	= params.eventMessage || "";
		data.eventVideoPlaybackDetails = params.eventVideoPlaybackDetails || "";
		data.referrer		= params.referrer || "";
		data.videoId		= params.videoId || "";

		$.ajax({
			type: 'PUT',
			url: '/api/avEventTracker',
			contentType : 'application/json',
			data: JSON.stringify(data),
			dataType: 'json'
		})
		.done(function(data) {
			//console.log("avEventTracker: callback");
		})	
	}
	
}

module.exports = AVEventTracker;