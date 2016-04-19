var mongoose = require('mongoose');

var featureVideo_schema = mongoose.Schema({
	featureVideoList: {type: mongoose.Schema.ObjectId, ref: 'FeatureVideoList'},
	featureVideoListId: {type: String}


});

module.exports = {
	connectionName	: "AirVuz_v1",
	modelName				: "FeatureVideoList",
	schema					: featureVideo_schema
};