var mongoose = require('mongoose');

var favVideoList_schema = mongoose.Schema({

	favVideoList:  {type: mongoose.Schema.ObjectId, ref: 'FavVideoList'},
	favVideoListId: {type: String}
	

});

module.exports = {
	connectionName	: "AirVuz_v1",
	modelName				: "FavVideoList",
	schema					: favVideoList_schema
};