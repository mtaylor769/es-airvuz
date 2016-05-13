var mongoose = require('mongoose');

/*
 * 
 */
var NotificationsSchema = mongoose.Schema({
	
	/*
	 * The userId of the person who has taken an action that will be notified to another user.
	 */
	actionUserId : {
		required: true,
		type: mongoose.Schema.ObjectId, ref: 'User'
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
		required: true,
		type: mongoose.Schema.ObjectId, ref: 'User'
	}

});

module.exports = {
	connectionName	: "main",
	modelName				: "NotificationsSchema",
	schema					: NotificationsSchema
};