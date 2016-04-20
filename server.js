// sudo npm run start:server
// sudo NODE_ENV=production npm run start:server

var log4js											= require('log4js');
var logger											= log4js.getLogger('server');


logger.info("starting a server ...");

global.NODE_ENV = process.env.NODE_ENV || 'development';
global.IS_PRODUCTION = NODE_ENV === 'production';
global.IS_DEVELOPMENT = NODE_ENV === 'development';
global.IS_NODE = true;

if(global.NODE_ENV === "production") {
	logger.setLevel("INFO");	
}

logger.info("NODE_ENV: " + global.NODE_ENV);
logger.info("IS_PRODUCTION: " + global.IS_PRODUCTION);
logger.info("IS_DEVELOPMENT: " + global.IS_DEVELOPMENT);

// Initialize database connections
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

//SSL certs
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate, passphrase: 'startup'};
var https       = require('https').createServer(credentials, app).listen(443);
var http        = require("http").createServer(app);
var passport    = require('passport');


var config      = require('./config/config')[global.NODE_ENV];

// Makes a global variable for templates to get client code.
// YOU MUST RUN WEBPACK FOR THE MANIFEST FILE TO EXIST.
app.locals.sourceManifest = require('./public/manifest.json');

//   __  __ _     _     _ _
//  |  \/  (_) __| | __| | | _____      ____ _ _ __ ___
//  | |\/| | |/ _` |/ _` | |/ _ \ \ /\ / / _` | '__/ _ \
//  | |  | | | (_| | (_| | |  __/\ V  V / (_| | | |  __/
//  |_|  |_|_|\__,_|\__,_|_|\___| \_/\_/ \__,_|_|  \___|su
//

var compression = require('compression');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var pubPath = path.resolve(__dirname, '/public');
logger.debug("pubPath:" + pubPath);

app.use(morgan('dev'));
app.use(compression());
//app.use(express.static(path.resolve(__dirname, '/public')));
app.use('/public', express.static('public'));
app.use('/client', express.static('client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/admin', express.static(path.resolve(__dirname, './admin')));
app.use('/admin/*', function (req, res) {
  res.sendFile(path.resolve(__dirname, './admin/index.html'));
});



require('./app/config/passport/local')(passport, config);
require('./app/config/passport/facebook')(passport, config);
require('./app/config/passport/google')(passport, config);
//require('./app/config/passport/instagram')(passport, config);

app.use(passport.initialize());
app.use(passport.session());



//      _    ____ ___   ____             _
//     / \  |  _ \_ _| |  _ \ ___  _   _| |_ ___ ___
//    / _ \ | |_) | |  | |_) / _ \| | | | __/ _ \ __|
//   / ___ \|  __/| |  |  _ < (_) | |_| | |_  __\__ \
//  /_/   \_\_|  |___| |_| \_\___/ \__,_|\__\___|___/
//
app.use(require('./app/routes/api/routes'));


var viewManager				= require('./app/views/manager/viewManager');
var indexView					= require('./app/views/view/indexView');
var videoPlayerView		= require('./app/views/view/videoPlayerView');
var userProfileView		= require('./app/views/view/userProfileView');
var loginView 				= require('./app/views/view/loginView');
var videoUploadView		= require('./app/views/view/videoUploadView')


viewManager.addView({	view : indexView });
viewManager.addView({	view : userProfileView });
viewManager.addView({	view : videoPlayerView });
viewManager.addView({ view : loginView });
viewManager.addView({ view : videoUploadView });

app.get("/", function(req, res) {
	viewManager
		.getView({
			viewName				: indexView.getViewName(),
			request					: req,
			response				: res,
			sourceManifest	: app.locals.sourceManifest
		})
		.then(function(view) {
			res.send(view);
		})
		.catch(function(error) {
			logger.error("view[/] error:" + error);
		});

});

app.get("/login", function(req, res){
	viewManager
		.getView({
			viewName 				: loginView.getViewName(),
			request 				: req,
			response 				: res,
			sourceManifest  : app.locals.sourceManifest
		})
		.then(function(view){
			res.send(view);
		})
		.catch(function(error) {
			logger.error("loginView error:" + error);
		});
});

app.get("/userProfile", function(req, res) {
	viewManager
		.getView({
			viewName				: userProfileView.getViewName(),
			request					: req,
			response				: res,
			sourceManifest	: app.locals.sourceManifest
		})
		.then(function(view) {
			res.send(view);
		})
		.catch(function(error) {
			logger.error("userProfileView error:" + error);
		})

});

app.get("/videoPlayer/:id", function(req, res) {
	viewManager
		.getView({
			viewName				: videoPlayerView.getViewName(),
			request					: req,
			response				: res,
			sourceManifest	: app.locals.sourceManifest
		})
		.then(function(view) {
			res.send(view);
		})
		.catch(function(error) {
			logger.error("videoPlayerView error:" + error);
		})

});

//
app.get("/videoUpload", function(req, res) {
	viewManager
		.getView({
			viewName				: videoUploadView.getViewName(),
			request					: req,
			response				: res,
			sourceManifest	: app.locals.sourceManifest
		})
		.then(function(view) {
			res.send(view);
		})
		.catch(function(error) {
			logger.error("videoUploadView error:" + error);
		})

});


/*

app.get('/play', function (req, res) {
  res.render('play');
});
*/
//app.get(/.*/, function (req, res) {
//  res.render('index');
//});



app.listen(process.env.PORT || 80);


setTimeout(function() {
	logger.debug("TODO: remove me: loading crud ...");
	
	var loginCrud = require('./app/persistence/crud/events/login');
	loginCrud.create();
	
}, 100);

module.exports = app;