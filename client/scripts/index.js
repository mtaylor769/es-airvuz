require('../styles/index.css');
require('./config/jquery');



var AVEventTracker			= require('./avEventTracker');
var auth                = require('./auth');
var regexUrl            = null;
var test                = require('./test');
var token               = null;
var urlParseResults     = null;

require('./core');

window.Home = require('./home');
window.Upload = require('./upload');
window.videoPlayer = require('./videoPlayer');
window.userProfile = require('./userProfile');
window.Search = require('./search');

exports.add = function (a, b) { return a+b };

$(document).ready(function() {


// *************** start auth JS ***********************
//
$('.user-login').on('click', function(){
  auth.login();
});

$('.user-create').on('click', function(){
  auth.createUser();
});

$('.social-create-user-btn').on('click', function(){
  auth.socialCreateUser(token);
});

token = getParameterByName('token');

//This code should only run when a new user registers for the first time with a social media account
//dialog opened should prompt for user name
if (token) {
  $( '.social-create-user' ).dialog();
}

//
// ***************  end auth JS **********************

});



//
// ***************  Miscellaneous reusable functions ***********************
//
/*
*method takes in
name @string
url @string

example URL is login?userid=xyz
calling getParameterByName('userid') => xyz
*/
function getParameterByName(name, url) {
  if (!url) 
  {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, "\\$&");
  regexUrl = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i");
  urlParseResults = regexUrl.exec(url);
  if (!urlParseResults) 
  {
    return null;
  }
  if (!urlParseResults[2]) 
  {
    return '';
  }
  return decodeURIComponent(urlParseResults[2].replace(/\+/g, " "));
}
