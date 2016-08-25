var isSSL = window.location.protocol === 'https:';

if (!isSSL && window.location.hostname !== 'localhost') {
  window.location.href = 'https://' + window.location.host + window.location.pathname;
}

require('jquery');
require('bootstrap');
require('../../node_modules/bootstrap/dist/css/bootstrap.css');
require('../../node_modules/font-awesome/css/font-awesome.css');
require('./config/jquery');
require('dustjs-helpers');

require('./core');

window.Home = require('./home');
window.Upload = require('./upload');
window.videoPlayer = require('./videoPlayer');
window.userProfile = require('./userProfile');
window.Search = require('./search');
window.Category = require('./category');
window.PasswordReset = require('./pages/password-reset');

window.Static = require('./pages/static');

require('../styles/index.css');