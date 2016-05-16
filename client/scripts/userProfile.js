var identity      = require('./services/identity');
var user          = identity.currentUser;
var $profilePage  = null;
var userData      = {};


/*
* Templates
*/
var userShowcase      = require('../templates/userProfile/showcase-user.dust');
var ownerShowcase     = require('../templates/userProfile/showcase-owner.dust');
var userAllVideos     = require('../templates/userProfile/allvideos-user.dust');
var ownerAllVideos    = require('../templates/userProfile/allvideos-owner.dust');
var userProfileEdit   = require('../templates/userProfile/edit-profile.dust');

var okHtml            = '<div class="ok asdf"><span class="glyphicon glyphicon-ok"></span></div>';
var notSelectedHtml   = '<div class="not-selected asdf"><span class="glyphicon glyphicon-plus"></span></div>';
var removeHtml        = '<div class="removed asdf"><span class="glyphicon glyphicon-minus"></span></div>';

function showcaseAdd(videoId, boolean) {
  var data = {};
  data.id = videoId;
  data.isShowcase = boolean;
  console.log(data);
  $.ajax({
    type: 'POST',
    url: '/api/videos/showcase-update',
    data: data
  })
  .success(function(response) {
    console.log('response : ' + response);
  })
  .error(function(error) {
    console.log('error : ' + error);
  });
}


function bindEvents() {

  $('#edit-showcase').on('click', function() {
    $('.showcase').each(function(i, link) {
      var isShowcase = $(link).attr('data-showcase');
      if(isShowcase === 'true') {
        $(link).append(okHtml);
      } else {
        $(link).append(notSelectedHtml);
      }
    });
    var a = ($('.showcase')).children();
    $(a).on('click', function() {
      console.log('running function');
      var buttonDiv = $(this).parent();
      var videoId = buttonDiv.attr('data-videoid');
      var status = buttonDiv.attr('data-showcase');
      $(this).remove();
      if(status === 'true') {
        $(buttonDiv).append(removeHtml);
        $(buttonDiv).attr('data-showcase', 'false');
        showcaseAdd(videoId, false);
      } else {
        $(buttonDiv).append(okHtml);
        $(buttonDiv).attr('data-showcase', 'true');
        showcaseAdd(videoId, true);
      }
    });
  });

  $(window).on('resize', function() {
    var windowWidth = $(window).width();
    var isActive = $('#about').hasClass('active');
    if(windowWidth >= 992 && isActive) {
      $('#showcase-tab').click();
    }
  });

  function asdf() {
    console.log('running function');
    var buttonDiv = $(this).parent();
    var status = buttonDiv.attr('data-showcase');
    $(this).remove();
    if(status === 'true') {
      $(buttonDiv).append(removeHtml);
      $(buttonDiv).attr('data-showcase', 'false');
      //showcaseAdd('', false);
    } else {
      $(buttonDiv).append(okHtml);
      $(buttonDiv).attr('data-showcase', 'true');
      //showcaseAdd('', true);
    }
  }

  $profilePage
    .on('click', '.asdf', asdf)
    .on('click', '#save-edit-btn', changeProfile);
}

function changeProfile() {
  $('#save-changes').modal('show');
  $('#save-changes')
    .on('click', '#save-changes-btn', editProfile);
}

function editProfile() {
  var userName            =$("$username").val();
  var emailAddress        = $("#email").val();
  var aboutMe             = $("#aboutme").val();
  var facebook            = $("#facebook").val();
  var googleplus          = $("#google").val();
  var twitter             = $("#twitter").val();
  var instagram           = $("#instagram").val();
  var lastName            = $("#lastname").val();
  var firstName           = $("#firstname").val();

  if (userName) {
    userData.userName = userName;
  }
  if (emailAddress) {
    userData.emailAddress = emailAddress;
  }

  if (firstName) {
    userData.firstName = firstName;
  }
  if (lastName) {
    userData.lastName = lastName;
  }
  if (aboutMe) {
    userData.aboutMe = aboutMe;
  }
  if (facebook) {
    userData.facebook = facebook;
  }
  if (googleplus) {
    userData.google = google;
  }
  if (twitter) {
    userData.twitter = twitter;
  }
  if (instagram) {
    userData.instagram = instagram;
  }

  //TODO: pop dialog confirm
  

  $.ajax({
    type:'PUT',
    url: '/api/users/' + user._id,
    data: userData
  })
  .success(function(response) {
    user = response;
  })
  .error(function(error) {
  });

}

function initialize() {
  $profilePage = $('#user-profile');
  if(user.userName === profileUser.userName) {
    ownerShowcase({videos: profileVideos}, function (err, html) {
      $('#showcase').html(html);
    });
    ownerAllVideos({videos: profileVideos}, function(err, html) {
      $('#allvideos').html(html);
    });
    userProfileEdit({user: profileUser}, function (err, html) {
      $('#edit-profile').html(html);
    });
  }
  $("[name='showcase-default']").bootstrapSwitch({
    size: 'mini'
  });
  console.log('initalize');
  bindEvents();
}

module.exports = {
  initialize: initialize
};