var mongoose = require('mongoose');

//require( __dirname + '/users.js');

var menu_schema = mongoose.Schema({

	menu:  {type: mongoose.Schema.ObjectId, ref: 'Menu'},
	MenuName: {type: String},
	WebAddress: {type : String},
	Description: {type: String},
	mainMenu: Boolean,
	footer: Boolean

});


module.exports = {
	connectionName	: "AirVuz_v1",
	modelName				: "Menu",
	schema					: menu_schema
};