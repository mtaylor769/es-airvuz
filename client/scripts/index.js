var isSSL = window.location.protocol === 'https:';

if (!isSSL && window.location.hostname !== 'localhost') {
  window.location.href = 'https://' + window.location.host + window.location.pathname;
}

require('jquery');
require('bootstrap');
require('../../node_modules/bootstrap/dist/css/bootstrap.css');
require('./config/jquery');
require('dustjs-helpers');

require('./core');

require('../scripts/services/pageTimer');

// shared style
// home & videoPlayer
require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');
// upload & user profile
require('../../node_modules/bootstrap-tagsinput/dist/bootstrap-tagsinput.css');
// videoPlayer & user profile
require('../../node_modules/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css');

// home style
require('../styles/home.css');

// category style
require('../styles/category.css');

// upload style

require('../styles/upload.css');

// videoPlayer style
require('../../node_modules/video.js/dist/video-js.css');
require('../../node_modules/videojs-resolution-switcher/lib/videojs-resolution-switcher.css');

switch(window.page) {
  case 'home':
    require(['./home'], _loadPage);
    break;
  case 'category':
    require(['./category'], _loadPage);
    break;
  case 'upload':
    require(['./upload'], _loadPage);
    break;
  case 'videoPlayer':
    require(['./videoPlayer'], _loadPage);
    break;
  case 'userProfile':
    require(['./userProfile'], _loadPage);
    break;
  case 'search':
    require(['./search'], _loadPage);
    break;
  case 'password-reset':
    require(['./pages/password-reset/index'], _loadPage);
    break;
  // case 'static':
  //   require(['./pages/static/index'], _loadPage);
}

function _loadPage(page) {
  page.initialize(window.pageParams);
}

require('../styles/index.css');
require('../styles/icons.css');