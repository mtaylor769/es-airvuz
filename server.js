// sudo npm run start:server
// sudo NODE_ENV=production npm run start:server

var log4js											= require('log4js');
var logger											= log4js.getLogger('server');


logger.info("starting a server ...");

global.NODE_ENV = process.env.NODE_ENV || 'development';
global.IS_PRODUCTION = NODE_ENV === 'production';
global.IS_DEVELOPMENT = NODE_ENV === 'development' || NODE_ENV === 'beta';
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
var http        = require("http").createServer(app);

// Makes a global variable for templates to get client code.
// YOU MUST RUN WEBPACK FOR THE MANIFEST FILE TO EXIST.
app.locals.sourceManifest = require('./public/manifest.json');
// prevent x-powerd-by header to show up
app.disable('x-powered-by');
//   __  __ _     _     _ _
//  |  \/  (_) __| | __| | | _____      ____ _ _ __ ___
//  | |\/| | |/ _` |/ _` | |/ _ \ \ /\ / / _` | '__/ _ \
//  | |  | | | (_| | (_| | |  __/\ V  V / (_| | | |  __/
//  |_|  |_|_|\__,_|\__,_|_|\___| \_/\_/ \__,_|_|  \___|su
//

var compression = require('compression');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var hsts = require('hsts');

var pubPath = path.resolve(__dirname, '/public');
logger.debug("pubPath:" + pubPath);

app.use(morgan('dev'));
app.use(compression());

/**
 * HTTP Strict Transport Security
 */
// TODO: preload flag once ssl and hsts working
var hstsMaxAge = 31536000;
app.use(hsts({
	maxAge: hstsMaxAge,
	includeSubDomains: true,
	force: true
}));

//app.use(express.static(path.resolve(__dirname, '/public')));
app.use('/public', express.static('public'));
app.use('/client', express.static('client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/admin', express.static(path.resolve(__dirname, './admin')));
app.use('/admin/*', function (req, res) {
  res.sendFile(path.resolve(__dirname, './admin/index.html'));
});

//      _    ____ ___   ____             _
//     / \  |  _ \_ _| |  _ \ ___  _   _| |_ ___ ___
//    / _ \ | |_) | |  | |_) / _ \| | | | __/ _ \ __|
//   / ___ \|  __/| |  |  _ < (_) | |_| | |_  __\__ \
//  /_/   \_\_|  |___| |_| \_\___/ \__,_|\__\___|___/
//

app.use(require('./app/routes/api/routes'));


var viewManager							= require('./app/views/manager/viewManager');
var indexView								= require('./app/views/view/indexView');
var videoPlayerView					= require('./app/views/view/videoPlayerView');
var userProfileView					= require('./app/views/view/userProfileView');
var videoUploadView					= require('./app/views/view/videoUploadView');
var searchView							= require('./app/views/view/searchView');
var categoryView						= require('./app/views/view/categoryView');
var staticView							= require('./app/views/view/staticView');
var videoPlayerEmbedView 		= require('./app/views/view/videoPlayerEmbedView');
var notificationView				= require('./app/views/view/notificationView');
var passwordResetView				= require('./app/views/view/passwordResetView');
var notFoundView						= require('./app/views/view/notFoundView');


viewManager.addView({	view : indexView });
viewManager.addView({	view : userProfileView });
viewManager.addView({	view : videoPlayerView });
viewManager.addView({ view : videoPlayerEmbedView });
viewManager.addView({ view : videoUploadView });
viewManager.addView({ view : searchView });
viewManager.addView({ view : categoryView });
viewManager.addView({ view : notificationView});
viewManager.addView({ view : passwordResetView});
viewManager.addView({ view : notFoundView});
viewManager.addView({ view : staticView('terms') });
viewManager.addView({ view : staticView('privacy') });
viewManager.addView({ view : staticView('copyright') });
viewManager.addView({ view : staticView('about') });
viewManager.addView({ view : staticView('community') });
viewManager.addView({ view : staticView('media') });
// viewManager.addView({ view : staticView('forms') });

function loadView(req, res, name) {
	viewManager
			.getView({
				viewName				: name,
				request					: req,
				response				: res,
				sourceManifest	: app.locals.sourceManifest
			})
			.then(function(view) {
				res.send(view);
			})
			.catch(function(error) {
				logger.error(name + " loading view error:" + error);
			});
}

app.use(function forcePreferredDomain(req, res, next) {
	var host = req.get('host');
	if (global.IS_PRODUCTION && host.indexOf('airvuz.com') > -1 && host !== 'www.airvuz.com') {
		return res.redirect(301, 'https://www.airvuz.com' + req.originalUrl);
	}
	return next();
});

app.get("/", function(req, res) {
	loadView(req, res, indexView.getViewName());
});

app.get("/email-confirmation/:id", function(req, res) {
	loadView(req, res, indexView.getViewName());
});

app.get("/user/:userNameUrl", function(req, res) {
	loadView(req, res, userProfileView.getViewName());
});

// support older url /play?id=...
app.get('/play', function (req, res) {
	res.redirect('/video/' + req.query.id);
});

app.get("/video/:id", function(req, res) {
	loadView(req, res, videoPlayerView.getViewName());
});

app.get("/videoPlayerEmbed/:id", function(req, res) {
	loadView(req, res, videoPlayerEmbedView.getViewName());
});

app.get("/videoUpload", function(req, res) {
	loadView(req, res, videoUploadView.getViewName());
});

app.get("/search", function(req, res) {
	loadView(req, res, searchView.getViewName());
});

app.get("/category/:category", function(req, res) {
	loadView(req, res, categoryView.getViewName());
});

app.get("/notifications/:id", function(req, res) {
	loadView(req, res, notificationView.getViewName());
});

app.get('/password-reset/:code', function (req, res) {
	loadView(req, res, passwordResetView.getViewName());
});

/**
 * Static page
 */
app.get("/terms", function(req, res) {
	loadView(req, res, 'terms');
});

app.get("/privacy", function(req, res) {
	loadView(req, res, 'privacy');
});

app.get("/copyright", function(req, res) {
	loadView(req, res, 'copyright');
});

app.get("/copyright", function(req, res) {
	loadView(req, res, 'copyright');
});

app.get("/about", function(req, res) {
	loadView(req, res, 'about');
});

app.get("/community", function(req, res) {
	loadView(req, res, 'community');
});

app.get("/media", function(req, res) {
	loadView(req, res, 'media');
});

// app.get("/forms", function(req, res) {
// 	loadView(req, res, 'forms');
// });

app.get("/social-login", function(req, res) {
	res.sendFile(path.join(__dirname, './client/social-login.html'));
});

app.get("/google2ad042ef42b82b4f.html", function(req, res) {
	res.sendFile(path.join(__dirname, './client/google2ad042ef42b82b4f.html'));
});

app.use(function (req, res) {
	if (req.accepts('html')) {
		return loadView(req, res, notFoundView.getViewName());
	}

	if (req.accepts('json')) {
		return res.json({error: 'Not found'});
	}

	res.send('Not found');
});

app.listen(process.env.PORT || 80);

module.exports = app;