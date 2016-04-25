// Client Side
var AVEventTracker = function(params) {
	var params	= params || null;
	var data		= {};
	
	if(params !== null) {
		data.codeSource		= params.codeSource || "";
		data.eventName		= params.eventName || "";
		data.eventSource	= params.eventSource || "browser";
		data.eventType		= params.eventType	|| ""
		data.userId				= params.userId	|| "";
	
		$.ajax({
			type: 'PUT',
			url: '/api/avEventTracker',
			data: data,
			dataType: 'json'
		})
		.done(function(data) {
			console.log("avEventTracker: callback");
		})	
	}
	
}

module.exports = AVEventTracker;