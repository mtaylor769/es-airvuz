var mongoose = require('mongoose');


var catagory_schema = mongoose.Schema({

	catagory: {type:mongoose.Schema.ObjectId, ref:'Catagory'},
	catagoryName: {type:String},
	images: [{
	    path: String,
	    dimension: String,
	    dpi: Number
	  }]
});

module.exports = {
	connectionName	: "AirVuz_v1",
	modelName				: "Catagory",
	schema					: catagory_schema
};


