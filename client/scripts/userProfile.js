var identity      = require('./services/identity');
var user          = identity;
var $profilePage  = null;


/*
* Templates
*/
var userShowcase = require('../templates/userProfile/showcase-user.dust');
var ownerShowcase = require('../templates/userProfile/showcase-owner.dust');
var userAllVideos = require('../templates/userProfile/allvideos-user.dust');
var ownerAllVideos = require('../templates/userProfile/allvideos-owner.dust');


function bindEvents() {

  $('#all-videos').on('click', function() {
    //if(user.userName === profileUser.userName) {
    if('afroza0210' === profileUser.userName) {
      ownerAllVideos({videos: profileVideos}, function (err, html) {
        $profilePage.html(html);
      });
    } else {
      userAllVideos({videos: profileVideos}, function (err, html) {
        $profilePage.html(html)
      })
    }
  });

  $('#showcase').on('click', function(){
    //if(user.userName === profileUser.userName) {
    if('afroza0210' === profileUser.userName) {
      ownerShowcase({videos: profileVideos}, function (err, html) {
        $profilePage.html(html);
      });
    } else {
      userShowcase({videos: profileVideos}, function (err, html) {
        $profilePage.html(html)
      })
    }
  });


}


function initialize() {
  $profilePage = $('#user-profile-wrapper');
  //if(user.userName === profileUser.userName) {
  if('afroza0210' === profileUser.userName) {
    ownerShowcase({videos: profileVideos}, function (err, html) {
      $profilePage.html(html);
    });
  }
  console.log('initalize');
  bindEvents();
}

module.exports = {
  initialize: initialize
};