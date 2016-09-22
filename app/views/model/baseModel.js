// YOU MUST RUN WEBPACK FOR THE MANIFEST FILE TO EXIST.
var sourceManifest = require('../../../public/manifest.json');
var CLOUD_FRONT_CDN = require('../../../app/config/amazon.config').CDN_URL;
var scriptPath = (global.IS_PRODUCTION ? CLOUD_FRONT_CDN : '') + '/public/';

var BaseView = function() {
	// share view data
	this.data = {
		script: {
			css: scriptPath + sourceManifest['airvuz.css'],
			js: scriptPath + sourceManifest['airvuz.js'],
			vendorJs: scriptPath + sourceManifest['vendor.js']
		},
		cdnUrl: ''
	};
};

module.exports = BaseView;