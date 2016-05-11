var identity      = require('./services/identity');
var user          = identity;
var $profilePage  = null;


/*
* Templates
*/
var userShowcase   = require('../templates/userProfile/showcase-user.dust');
var ownerShowcase  = require('../templates/userProfile/showcase-owner.dust');
var userAllVideos  = require('../templates/userProfile/allvideos-user.dust');
var ownerAllVideos = require('../templates/userProfile/allvideos-owner.dust');

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
  })
}


function bindEvents() {

  $('#edit-showcase').on('click', function() {
    $('.showcase').each(function(i, link) {
      var isShowcase = $(link).attr('data-showcase');
      if(isShowcase === 'true') {
        $(link).append(okHtml);
      } else {
        $(link).append(notSelectedHtml)
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
    })
  });

  $(window).on('resize', function() {
    var windowWidth = $(window).width();
    var isActive = $('#about').hasClass('active');
    if(windowWidth >= 992 && isActive) {
      $('#showcase-tab').click();
    }
  })

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
    .on('click', '.asdf', asdf);
}


function initialize() {
  $profilePage = $('#user-profile');
  if(user.userName === profileUser.userName) {
    ownerShowcase({videos: profileVideos}, function (err, html) {
      $('#showcase').html(html);
    });
    ownerAllVideos({videos: profileVideos}, function(err, html) {
      $('#allvideos').html(html);
    })
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