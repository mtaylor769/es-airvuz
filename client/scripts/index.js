require('../styles/index.css');
require('./config/jquery');

var AVEventTracker			= require('./avEventTracker');

require('./core');

window.Home = require('./home');
window.Upload = require('./upload');
window.videoPlayer = require('./videoPlayer');
window.userProfile = require('./userProfile');
window.Search = require('./search');
window.Category = require('./category');