// sudo npm run start:server

var log4js											= require('log4js');
var logger											= log4js.getLogger('server');


logger.debug(" starting a server ...");



global.NODE_ENV = process.env.NODE_ENV || 'development';
global.IS_PRODUCTION = NODE_ENV === 'production';
global.IS_DEVELOPMENT = NODE_ENV === 'development';
global.IS_NODE = true;

require('./app/persistence/database/database');

// Enable Mongoose
// 
// 
//var mongoose = require('./mongoose');
//mongoose.connect(process.env.MONGODB_CONNECTION || 'mongodb://localhostAirVuzV2');

var path        = require('path');
var express     = require('express');
var fs          = require('fs');
var app         = express();
var bodyParser  = require('body-parser');
var jwt         = require('jsonwebtoken');


setTimeout(function() {
	logger.debug("loading crud ...");
	
	var loginCrud = require('./app/persistence/crud/events/login');
	loginCrud.create();
	
}, 100);