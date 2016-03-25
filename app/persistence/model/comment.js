var mongoose = require('mongoose');

/*
 * 
 * @type type
 * 
 * pid	= parentCommentId
 * rd		= replyDepth
 * 
 * 
 * id		pid		rd
 * 1		0			0			------
 * 2		1			1						------
 * 3		1			1						------
 * 4		0			0			------
 * 5		0			0			------
 * 6		5			1						------
 * 7		0			0			------
 * 
 * params.sortOrder
 * 
 * getCommentsByVideoId(params)
 *		
 * getCommentsByParentId(params)
 * 
 * 
 * params.parentComment
 * createComment(params) {
 *	replyDepth = parentComment.replyDepth + 1;
 * }
 * 
 * 
 * 
 * 
 * 
 */
var CommentSchema = mongoose.Schema({

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

	commentSortOrder : {
		default : Date.now,
		type		: Date
	},

	/*
	 * Identifies if the comment is visible.
	 */
	isVisible: {
		required	: true,
		type			: Boolean
	},
	
	parentCommentId : {
		type	: String
	},

	replyCount : {
		default: 0,
		type: Number

	},
	/*
	 * Indicates the depth of user replies. 0 indicates at the root, 1 indicates first reply depth.
	 */
	replyDepth : {
		required	: true,
		default		: 0,
		type			: Number
	},

	/*
	 * The userId of the person who made the comment.
	 */
	userId : {
		required: true,
		type: mongoose.Schema.ObjectId, ref: 'User'
	}

});
mongoose.model('Comment', CommentSchema);