var identity      = require('./services/identity');
var user          = identity.currentUser || null;
var $profilePage  = null;
var userData      = {};


/*
* Templates
*/
var userShowcase          = require('../templates/userProfile/showcase-user.dust');
var ownerShowcase         = require('../templates/userProfile/showcase-owner.dust');
var userAllVideosHtml     = require('../templates/userProfile/allvideos-user.dust');
var ownerAllVideosHtml    = require('../templates/userProfile/allvideos-owner.dust');
var userProfileEdit       = require('../templates/userProfile/edit-profile.dust');
var aboutMe               = require('../templates/userProfile/about.dust');
var userInfo              = require('../templates/userProfile/userInfo.dust');

var okHtml                = '<div class="ok asdf"><span class="glyphicon glyphicon-ok"></span></div>';
var notSelectedHtml       = '<div class="not-selected asdf"><span class="glyphicon glyphicon-plus"></span></div>';
var removeHtml            = '<div class="removed asdf"><span class="glyphicon glyphicon-minus"></span></div>';

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
  $('#edit-showcase').on('click', editShowcase);
  $profilePage
    .on('click', '.asdf', asdf)
    .on('click', '#save-edit-btn', changeProfile)
    .on('click', '#change-password-btn', changePassword);

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
}

function doneEditShowcase(){
  $('.asdf').hide();
  $('.edit-showcase-btn').toggle();
  $('.edit-done-btn').toggle();
  $('#edit-showcase').on('click', editShowcase);
  location.reload();
}

function editShowcase() {
  $('.edit-showcase-btn').toggle();
  $('.edit-done-btn').toggle();
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

  $('.edit-done-btn').on('click', doneEditShowcase);
}

function changePassword() {
  $('#change-password').modal('show');
  $('#change-password')
  .on('click', '#new-password-btn', confirmPasswordChange);
}

function confirmPasswordChange() {
  var data                  = {};
  data.oldPassword          = $("#old-password").val();
  data.newPassword          = $("#new-password").val();
  data.confirmPassword      = $("#confirm-password").val();

  if(!data.oldPassword || data.oldPassword === '') {
    console.log('Please enter in current password');
    return false;
  }
  if(data.newPassword === '' || data.newPassword !== data.confirmPassword) {
    console.log('New Password Invalid');
    return false;
  } 
  $.ajax({
    type:'PUT',
    url: '/api/users/' + user._id,
    data: data
  })
  .success(function(response) {
    if(response.status==='OK') {
      user = response.data;

    } else {
      console.log(response);
      
    }
  })
  .error(function(error) {

  });
  $('#change-password').modal('hide');

}

function changeProfile() {
  $('#save-changes').modal('show');
  $('#save-changes')
    .on('click', '#save-changes-btn', editProfile);
}

function editProfile() {
  var userName            = $("#username").val();
  var emailAddress        = $("#email").val();
  var myAbout             = $("#aboutme").val();
  var facebook            = $("#facebook").val();
  var googleplus          = $("#google").val();
  var twitter             = $("#twitter").val();
  var instagram           = $("#instagram").val();
  var lastName            = $("#lastname").val();
  var firstName           = $("#firstname").val();
  var allowHire           = $("#hire").prop('checked');
  var allowDonation       = $("#donate").prop('checked');
  var imgFile                = $("#profile-image").val();

  if (userName && userName !== profileUser.userName) {
    userData.userName = userName;
  }
  if (emailAddress && emailAddress !== profileUser.emailAddress) {
    userData.emailAddress = emailAddress;
  }

  if (firstName && firstName !== profileUser.firstName) {
    userData.firstName = firstName;
  }
  if (lastName && lastName !== profileUser.lastName) {
    userData.lastName = lastName;
  }
  if (myAbout && myAbout !== profileUser.aboutMe) {
    userData.aboutMe = myAbout;
  }
  if (imgFile) {

  }

  if (profileUser.socialMediaLinks) {
    if (facebook && facebook !== profileUser.socialMediaLinks.facebookUrl) {
      userData.socialMediaLinks.facebookUrl = facebook;
    }
    if (googleplus && googleplus !== profileUser.socialMediaLinks.googlePlusUrl ) {
      userData.socialMediaLinks.googlePlusUrl = google;
    }
    if (twitter && twitter !== profileUser.socialMediaLinks.twitterUrl) {
      userData.socialMediaLinks.twitterUrl = twitter;
    }
    if (instagram && instagram !== profileUser.socialMediaLinks.instagramUrl) {
      userData.socialMediaLinks.instagramUrl = instagram;
    }
  } else {
    userData.socialMediaLinks = {};
    if (facebook) {
      userData.socialMediaLinks.facebookUrl = facebook;
    }
    if (googleplus) {
      userData.socialMediaLinks.googlePlusUrl = google;
    }
    if (twitter) {
      userData.socialMediaLinks.twitterUrl = twitter;
    }
    if (instagram) {
      userData.socialMediaLinks.instagramUrl = instagram;
    }
  }

  if (allowDonation !== profileUser.allowDonation) {
    userData.allowDonation = allowDonation;
  }
  if (allowHire !== profileUser.allowHire) {
    userData.allowHire     = allowHire;
  }

  if (allowDonation) {
    $('.donate-btn').show();
  } else {
    $('.donate-btn').hide();
  }

  if (allowHire) {
    $('.hire-btn').show();
  } else {
    $('.hire-btn').hide();
  }
  
  $.ajax({
    type:'PUT',
    url: '/api/users/' + user._id,
    data: userData
  })
  .success(function(response) {
    user = response;
    $('#save-changes').modal('hide');
  })
  .error(function(error) {
    console.log('error from serverside');
    $('#save-changes').modal('hide');
  });
}

function requestVideoSort(sortBy, id) {
  var params = {
    sortBy : sortBy
  };
  $.ajax({
    type: 'GET',
    url: '/api/videos/user/'+id,
    data: params
  })
  .success(function(data) {
    if (data.status==='OK') {
      if(userNameCheck === profileUser.userName) {
        ownerAllVideosHtml({videos: data.data}, function(err, html) {
          $('#allvideos').html(html);
          // $('#sort-owner-all-list')
          //   .on('click', '#sort-owner-all-vuz', sortByVuz)
          //   .on('click', '#sort-owner-all-dasc', sortByDasc)
          //   .on('click', '#sort-owner-all-ddesc', sortByDdesc)
          //   .on('click', '#sort-owner-all-likes', sortByLikes);
        });
      } else {
        userAllVideosHtml({videos: data.data}, function(err, html){
          $('#allvideos').html(html);
        });
      }
    } else {
      console.log('server side error' + data.data);
    }
  })
  .error(function(error) {
    console.log('error : ' + error);
  });
}

function sortShowcase(sortBy, id) {
  var params = {
    sortBy : sortBy
  };
  $.ajax({
    type: 'GET',
    url: '/api/videos/user/'+id,
    data: params
  })
  .success(function(data) {
    if (data.status==='OK') {
      if(userNameCheck === profileUser.userName) {
        ownerShowcase({videos: data.data}, function(err, html) {
          $('#allvideos').html(html);
        });
      } else {
        userShowcase({showcase: data.data}, function(err, html){
          $('#allvideos').html(html);
        });
      }
    } else {
      console.log('server side error' + data.data);
    }
  })
  .error(function(error) {
    console.log('error : ' + error);
  });
}

function sortByVuz() {
  requestVideoSort('vuz', profileUser._id);
}

function sortByDasc() {
  requestVideoSort('dasc', profileUser._id);
}

function sortByDdesc() {
  requestVideoSort('ddesc', profileUser._id);
}

function sortByLikes() {
  requestVideoSort('likes', profileUser._id);
}

function initialize() {
  $profilePage = $('#user-profile');
  userInfo({user: profileUser}, function(err, html){
    $("#userInfoData").html(html);
  });
  if (profileUser.allowDonation) {
    $('.donate-btn').show();
  } else {
    $('.donate-btn').hide();
  }

  if (profileUser.allowHire) {
    $('.hire-btn').show();
  } else {
    $('.hire-btn').hide();
  }

  var userNameCheck = '';

  $('.sort-owner-all-list')
    .on('click', '.sort-owner-all-vuz', sortByVuz)
    .on('click', '.sort-owner-all-dasc', sortByDasc)
    .on('click', '.sort-owner-all-ddesc', sortByDdesc)
    .on('click', '.sort-owner-all-likes', sortByLikes);

  $('.sort-showcase')
    .on('click', '.sort-showcase-vuz', sortShowcase('vuz', profileUser._id))
    .on('click', '.sort-showcase-dasc', sortShowcase('dasc', profileUser._id))
    .on('click', '.sort-showcase-ddesc', sortShowcase('ddesc', profileUser._id))
    .on('click', '.sort-showcase-likes', sortShowcase('likes', profileUser._id));

  if (user) {
    userNameCheck = user.userName;
  }
  if(userNameCheck === profileUser.userName) {
    ownerShowcase({videos: showcaseOwnerVideos}, function (err, html) {
      $('#showcase').html(html);
    });
    ownerAllVideosHtml({videos: allOwnerVideos}, function(err, html) {
      $('#allvideos').html(html);
    });
    aboutMe({user: profileUser}, function(err, html){
      $("#about-me-section").html(html);
    });
    userProfileEdit({user: profileUser}, function (err, html) {
      $('#edit-profile').html(html);
    });
    $('.edit-tab').show();
    
  } else {
    $('.edit-tab').hide();
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