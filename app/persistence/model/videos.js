var mongoose = require('mongoose');

var videoSchema = mongoose.Schema({
	
	/*
	 * Old Name: AllowComments
	 * Are comments allowed for this video.
	 */
	allowComments: {
		default : true,
		type: Boolean
	},
	
	/*
	 * Old Name: AllowRatings
	 * 
	 */
	allowRatings: {
		default: true,
		type: Boolean
	},
	
	/*
	 * The type of camera used to make the video.
	 * @type {Object}
	 */
	cameraType:  {
		type: mongoose.Schema.ObjectId, ref: 'CameraType'
	},	
	
	/*
	 * Old Name: Categories
	 */
	categories: [{
		type: mongoose.Schema.ObjectId, ref: 'CategoryType'
	}],	

	commentCount: {
		default: 0,
		type: Number
	},
	/*
	 * Old Name: Channel
	 */
	/*
	channel:  {
		type: mongoose.Schema.ObjectId, ref: 'Channel'
	},
	*/
	/*
	 * Old Name: Description
	 * The description of the video file.
	 */
	description: {
		required	: true,
		type			: String
	},	
	airVuzDescription: String,
	/*
	 * The type of drone used to make the video.
	 * @type {Object}
	 */
	droneType:  {
		type: mongoose.Schema.ObjectId, ref: 'DroneType'
	},
	
	/* 
	 * Old Name: Duration 
	 * The length of the video file hh:mm:ss
	 */
	duration : {
		required	: true,
		type			: String
	},
	
	/*
	 * Identifies if the video is active, if true, can be shown, if false is not shown.
	 * @type {boolean}
	 */
	isActive : {
		default		: true,
		required	: true,
		type			: Boolean
	},
	/*
	 * Old Name : Like
	 * The number of times the video has been liked.
	 */
	likeCount: {
		default	: 0,
		type		: Number
	},	

	openGraphCacheDate: {
		default: Date.now(),
		type: Date
	},
	/*
	 * Old Name: RecordDate
	 */
	recordDate: {
		default:	Date.now,
		type:			Date
	},
	
	/*
	 * Old Name: Tags
	 */
	tags: [],

	/* 
	 * Old Name : Thumbnail
	 * the path to the thumbnail
	 */
	thumbnailPath : {
		required : true,
		type		 : String
	},

	/*
	 * Old Name : Title
	 * The title of the video
	 */
	title : {
		required	: true,
		type			: String
	},
	airVuzTitle: String,
	/*
	 * Old Name : UploadDate
	 * The date the video was uploaded.
	 */
	uploadDate: {
		default	: Date.now,
		type		: Date
	},

	/*
	 * Old Name : user
	 */
	userId: {
	 	ref				: 'Users',
	 	required	: true,
	 	type			: mongoose.Schema.ObjectId
	},
	
	/*
	 * Old Name : ViewCount
	 * The number of time the video has been viewed.
	 */
	viewCount: {
		default : 0,
		type: Number
	},


	/*
	 * Number of autoViews added to standard views
	 */
	autoViewCount: {
		default: 0,
		type: Number
	},

	
	/* 
	 * Old name : FileName
	 * the path and video file. 
	 */
	videoPath: {
		required	: true,
		type			: String 
	},

	curation: {
		isRanked: Boolean,
		isTagged: Boolean,
		isSeoTagged: Boolean,
		primaryCategory: Boolean
	},

	internalRanking: [],

	/*
	* Average of values in internalRanking[];
	*/
	internalRankAvg: Number,

	//internal tags specified by internal curators
	internalTags: [String],

	//primary category set by internal curators
	primaryCategory : {
		ref: 'CategoryType',
		required: false,
		type: mongoose.Schema.ObjectId
	},

	//seo tags specified by internal curators
	seoTags: [String],

	videoLocation: String,

	//attribute for internal video notes
	videoNotes: String,

	/*
	 * video location
	 * type: the shape being represented ["Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection", "Feature", or "FeatureCollection"]
	 * coordinates: an array of points determined by the "type" field [<longitude>, <latitude>] (order matters)
	 * index: Indexes this schema in 2dsphere format (allows mongodb and mongoose to query users based on geographic inclusion, intersection, and proximity)
	 */
	videoCoordinates: {
		type: String,
		name: String,
		coordinates: [Number],
		place_id: String,
		index: '2dsphere'
	},

	//speed: {type: Number, default: 1},
	//rating: {type: Number, default: 0},
	//ratingCounter: {type: Number, default: 0},
	//ViewedBy: [],
	//LikedBy:[],
	/*
	VideoLocation: [],//{"type":  [Number], index: '2dsphere'},
	formatted_address: String,
	CameraType: String,
	DroneType: String,
	*/
	
	//Statistics: {type: Boolean, default: true},
	//favourited: [],
	/*
	Comments:[{
		comment:String,
		comentatorId:String,
		comentatorPic:String,
		comentatorName:String,
		Time: {type: Date, default: Date.now}
	}]
	*/
	
	});

//video_schema.index({VideoLocation: 1});

module.exports = {
	connectionName	: "main",
	modelName				: "Video",
	schema					: videoSchema
};