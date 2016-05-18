var mongoose = require('mongoose');

/*
 * 
 */
var NotificationsSchema = mongoose.Schema({
	
	/*
	 * The userId of the person who has taken an action that will be notified to another user.
	 */
	actionUserId : {
		ref: 'Users',
		required: true,
		type: mongoose.Schema.ObjectId
	},	
	
	/*
	 * When the document was created.
	 */
	createdDate : {
		default: Date.now,
		type: Date
	},
	
	/*
	 * The notification type:
	 *	COMMENT | PRIVATE-MESSAGE
	 *	FOLLOW  | ALERTS STARTED FOLLOWING
	 *	LIKE		| ALERTS LIKED VIDEO
	 *	COMMENT REPLY | ALERTS REPLY TO COMMENT
	 *  SOCIAL-MEDIA-SHARE-** ANY SOCIAL MEDIA SERVICE **	| ALERTS VIDEO WAS SHARED AND ON WHAT SERVICE
	 */
	notificationType : {
		default		: ['COMMENT','PRIVATE-MESSAGE'],
		required	: true,
		type			: String
	},
	/*
	* The notification message
	*/
	notificationMessage : {
		required: true,
		type: String
	},
	
	/*
	 * The userId of the person who is being notified.
	 */
	notifiedUserId : {
		ref: 'Users',
		required: true,
		type: mongoose.Schema.ObjectId
	},
	/*
	* Flag to check if Notification has been seen already
	*/
	notificationViewed : {
		default: false,
		type: Boolean
	},
	videoId : {
		ref: 'Videos',
		required: false,
		type: mongoose.Schema.ObjectId
	}

});

module.exports = {
	connectionName	: "main",
	modelName				: "NotificationsSchema",
	schema					: NotificationsSchema
};