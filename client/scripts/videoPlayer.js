var AVEventTracker			               = require('./avEventTracker');
var identity                           = require('./services/identity');
var userIdentity                       = identity;
var user                               = identity.currentUser;
var notificationObject                 = {};
var $videoPage;
var screenWidth;

//toggle functions for mobile events
var toggles = {
      toggleLeft: function (nextPage, videoPage) {
        screenWidth = videoPage.width();
        nextPage.css("left", screenWidth);
        nextPage.addClass('display');
        nextPage.removeClass('mobile-display-none');
        videoPage.addClass('mobile-display-none');
        videoPage.removeClass('display');
        nextPage.add(videoPage).animate( {
          'left': '-=' + screenWidth + 'px'
        }, 300).promise().done(function() {
        })
      },
      toggleRight: function (videoPage, nextPage) {
        videoPage.css("right", screenWidth);
        videoPage.addClass('display');
        videoPage.removeClass('mobile-display-none');
        nextPage.addClass('mobile-display-none');
        nextPage.removeClass('display');
        videoPage.add(nextPage).animate({
          'left': '+=' + screenWidth + 'px'
        }, 300).promise().done(function(){
        })
      }
    };

//video increment
function incrementVideoCount() {
  var videoId = {};
  videoId.videoId = video._id;

  $.ajax({
      type: 'POST',
      url: '/api/videos/loaded',
      data: videoId,
      dataType: 'json'
    })
    .done(function(response) {
    })
    .error(function(error) {
    });
}

//check for user following and user video liked
function videoInfoCheck() {
  console.log(user);
  var checkObject = {};
  checkObject.userId = user._id;
  checkObject.videoId = video._id;
  checkObject.videoUserId = video.userId;

  $.ajax({
    type: 'GET',
    url: '/api/videos/videoInfoCheck',
    data: checkObject
  })
  .success(function(response) {
    console.log(response);
    if(response.like === true) {
      $('.like').addClass('airvuz-blue')
    }
    if(response.follow === true) {
      $('#follow').text('-');
    }
  })
  .error(function(error) {
  })
}

//function to persist autoplay data
function onAutoPlayChange(event, state) {
  var autoPlayObject = {};
  autoPlayObject.userId = user._id;
  autoPlayObject.autoPlay = state;

  $.ajax({
    type:'PUT',
    url: '/api/users/' + user._id,
    data: autoPlayObject
  })
  .success(function(response) {
    user.autoPlay = response.autoPlay;
    identity.save();
  })
  .error(function(error) {
  })
}

//bind events
function bindEvents() {

  //api calls

  //create comment and append
  $('#commentSave').on('click', function() {
    AVEventTracker({
      codeSource	: "videoPlayer",
      eventName		: "commentSave",
      eventType		: "click"
    });
    notificationObject.notificationType = 'COMMENT';
    notificationObject.notificationMessage = $(this).attr('value');
    var comment = {};
    comment.videoId = $(this).attr('value');
    comment.comment = $('#comment-text').val();
    comment.userId = user._id;
    console.log(comment);
    $.ajax({
        type: 'POST',
        url: '/api/comment',
        data: {comment: comment, notification: notificationObject},
        dataType: 'json'
      })
      .done(function(data) {
        var comment = data;
        var html = '<li class="comment-wrap">'+
          '<div class="flex">'+
          '<img src="' + "http://www.airvuz.com/" + user.profilePicture + '" height="50" width="50" class="border-radius-circle m-10-20">'+
          '<div class="m-t-20">'+
          '<p class="pos-absolute-r-15" datetime="' + comment.commentCreatedDate + '"></p>'+
          '<p class="m-b-0 airvuz-blue">' + user.userName + '</p>'+
          '<p class="m-b-0">' + comment.comment + '</p>'+
          '</div>'+
          '</div>'+
          '<div  id="' + comment._id + '">'+
          '<ul class="parentComment"></ul>'+
          '<div class="row">'+
          '<div class="reply col-xs-3 col-sm-2" value="' + comment._id + '" style="padding: 0 0 0 10px">'+
          '<span class="glyphicon glyphicon-share-alt" style="margin: 0 0 0 30px; transform: scaleY(-1);"></span>'+
          '<span style="font-size: 10px; margin-left: 2px">reply</span>'+
          '</div>'+
          '<div class="col-xs-3 col-md-2 commentReplies" value="' + comment._id + '">'+
          '<span style="margin: 0; padding: 0 0 0 10px; font-size: 10px;">replies <a>' + comment.replyCount + '</a></span>'+
          '</div>'+
          '</div>'+
          '</div>'+
          '</li>';
        $('.parent-comments').prepend(html);
        $('#comment-text').val('');
        var currentCount = $('.commentCount').text();
        var toNumber = Number(currentCount);
        $('.commentCount').text('  ' + (toNumber + 1) + '  ');
      })
  });

  //video like
  $('.like').on('click', function() {
    if(user._id && user._id !== video.userId) {
      var likeObject = {};
      likeObject.videoId = $(this).attr('data-videoId');
      likeObject.userId = user._id;

      $.ajax({
          type: 'POST',
          url: '/api/video-like',
          data: likeObject,
          dataType: 'json'
        })
        .done(function (response) {
          var likeLog = Number($('.like-count').text());
          if (response.status === 'liked') {
            AVEventTracker({
              codeSource	: "videoPlayer",
              eventName		: "videoLiked",
              eventType		: "click"
            });
            $('.like').addClass('airvuz-blue');
            $('.like-count').text(likeLog + 1)
          } else if (response.status === 'unliked') {
            AVEventTracker({
              codeSource	: "videoPlayer",
              eventName		: "videoUnliked",
              eventType		: "click"
            });
            $('.like').removeClass('airvuz-blue');
            $('.like-count').text(likeLog - 1)
          }
        })
        .fail(function (error) {
        });
    } else if(!user._id) {
      $('#like-modal').modal('show');
      $('.go-to-login').on('click', function () {
        $('#login-modal').modal('show');
      })
    } else {
      $('#like-self-modal').modal('show');
    }
  });

  //send report video info
  $('#send-report').on('click', function() {
    var reportData = {};
    reportData.videoId = $(this).attr('data-videoid');
    reportData.message = $('.report-text').val();
    $.ajax({
        type: 'POST',
        url: '/api/videos/report-video',
        data: reportData
      })
      .done(function(response) {
      })
      .error(function(error) {
      })
  });

  //follow video user
  $('#follow').on('click', function() {
    if(userIdentity._id && userIdentity._id !== video.userId) {
      var followData = {};
      followData.userId = userIdentity._id;
      followData.followingUserId = video.userId;
      $.ajax({
          type: 'POST',
          url: '/api/follow',
          data: followData
        })
        .success(function (response) {
          if(response.status === 'followed') {
            AVEventTracker({
              codeSource	: "videoPlayer",
              eventName		: "followedUser",
              eventType		: "click"
            });
            $('#follow').text('-');
          } else if(response.status === 'unfollowed'){
            AVEventTracker({
              codeSource	: "videoPlayer",
              eventName		: "unfollowedUser",
              eventType		: "click"
            });
            $('#follow').text('+');
          }
        })
        .error(function (error) {
        })
    } else if(!userIdentity._id) {
      $('#follow-modal').modal('show');
      $('.go-to-login').on('click', function() {
        $('#login-modal').modal('show');
      })
    } else {
      $('#follow-self-modal').modal('show');
    }
  });

  $('#').on('click', function() {
    var a = this;
    console.log(a);
  });

  //facebook modal event
  $('#facebook').click(function(e){
    e.preventDefault();
    FB.ui(
      {
        method: 'feed',
        name: video.name,
        link: window.location.href,
        picture: 's3-us-west-2.amazonaws.com/airvuz-drone-video/'+video.thumbnailPath,
        description: video.description,
        message: ""
      },
      function(response) {
        console.log(response);
      }
    );
  });

  //functions to move mobile screen
  $('.up-next').on('click', function(e) {
    e.preventDefault();
    var videoPage = $(this).parents().find('.videoplayback');
    var nextPage = videoPage.siblings();
    toggles.toggleLeft(nextPage, videoPage);
  });

  $('.videoback').on('click', function(e) {
    e.preventDefault();
    var nextPage = $(this).parents().find('.nextVideos');
    var videoPage = nextPage.siblings();
    toggles.toggleRight(videoPage, nextPage);
  });

  //share toggle
  $('.share').on('click', function() {
    $('.social-icons').toggle();
  });

  //embeded iframe modal
  $('.embed').on('click', function() {
    $('#embed-modal').modal('show');
  });

  // on off switch
  $('.onoffswitch input[type=checkbox]').on('click', function() {
    console.log($(this).val('off'));
  });

  //report modal
  $('.report').on('click', function() {
    $('#report-modal').modal('show');
  });

  //go to previous page
  $('.page-back').on('click', function() {
    window.history.back();
  });

  //comment modal
  $('#comment-text').on('click', function() {
    if(!userIdentity._id) {
      $('#comment-modal').modal('show');
      $('.go-to-login').on('click', function() {
        $('#login-modal').modal('show');
      })
    }
  });

  //event delegation start
  function commentReply() {

    //remove other comment boxes from DOM when another is selected
    $('.commentBox').remove();
    $('.reply').show();
    var elementId = '#'+$(this).attr('value');
    var parentCommentId = $(this).attr('value');
    var html = '<div style="display: none" class="flex commentBox">' +
      '<textarea id="comment" cols="80" rows="1" style="margin-bottom: 20px; width: 80%%; margin-left: 18%"></textarea>' +
      '<button class="btn background-orange border-radius-0 font-white" id="saveComment" style="margin-bottom: 20px;">Submit</button>' +
      '</div>';
    $(elementId).append(html);
    $('.commentBox').delay(200).slideDown();
    $(this).hide();

    //comment submit function
    $('#saveComment').click(function() {
      var self = this;
      var comment = {};
      comment.comment = $('#comment').val();
      comment.parentCommentId = parentCommentId;
      comment.userId = userIdentity._id;
      comment.videoId = '56fec7bb07354aaa096db3b8';

      $.ajax({
          type: 'POST',
          url: '/api/comment',
          data: comment,
          dataType: 'json'
        })
        .done(function(reply) {
          //insert comment on DOM
          console.log(reply);
          var html = '<div class="flex">'+
            '<img src="' + "http://www.airvuz.com/" + user.profilePicture + '" height="30" width="30" class="border-radius-circle m-10-20">'+
            '<div class="m-t-10">'+
            '<p class="pos-absolute-r-15" datetime="' + reply.commentCreatedDate + '"></p>'+
            '<p class="m-b-0 airvuz-blue">' + user.userName + '</p>'+
            '<p class="m-b-0">' + reply.comment + '</p>'+
            '</div>'+
            '</div>';

          $(self).parents('.comment-wrap').find('.parentComment').append(html);
          $('.commentBox').remove();
          $('.reply').show();
          var currentCount = $('.commentCount').text();
          var toNumber = Number(currentCount);
          $('.commentCount').text('  ' + (toNumber + 1) + '  ');
        })
    });
  }

  //get child comments
  function commentReplies() {
    var parentId = $(this).attr('value');
    var self = this;
    $.ajax({
        type:'GET',
        url: '/api/comment/byParent',
        data: {parentId: parentId}
      })
      .done(function(data) {

        //create child comment DOM elements
        var html = '';
        data.forEach(function(reply) {
          html += '<li>'+
            '<div class="flex">'+
            '<img src="' + "http://www.airvuz.com/" + user.profilePicture + '" height="30" width="30" class="border-radius-circle m-10-20">'+
            '<div class="m-t-10">'+
            '<p class="pos-absolute-r-15" datetime="' + reply.commentCreatedDate + '"></p>'+
            '<p class="m-b-0 airvuz-blue">' + user.userName + '</p>'+
            '<p class="m-b-0">' + reply.comment + '</p>'+
            '</div>'+
            '</div>' +
            '</li>'
        });

        //append child elements to DOM
        $(self).parents('.comment-wrap').find('.parentComment').append(html);
        if(data.length === 10) {
          html = '<div class="row m-t-10" style="text-align: center"><span><a class="moreReplies" value="'+parentId+'">load More</a></span></div>';
          console.log($(self));
          $(self).parent().siblings().append(html);
          $(self).hide();
        } else {
          console.log($(self));
          $(self).hide();
        }
      })
  }

  //description functions
  function moreDescription() {
    var html = '<div class="show-less-description"><span class="glyphicon glyphicon-chevron-up"></span></div>';
    $('#video-description').slideDown();
    $(this).hide();
    $('.description-container').append(html);
  }

  function lessDescription() {
    $('#video-description').slideUp();
    $(this).hide();
    $('.show-more-description').show();
  }

  ///////////////////////////////////////

  $videoPage
    .on('click', '.show-more-description', moreDescription)
    .on('click', '.show-less-description', lessDescription)
    .on('click', '.commentReplies', commentReplies)
    .on('click', '.reply', commentReply);

}

//page init function
function initialize() {

  //set video page
  $videoPage = $('.video-page');

  //run init functions
  incrementVideoCount();

  //only run if user is logged in
  if(userIdentity.isAuthenticated()){
    videoInfoCheck();
    $("[name='auto-play-input']").bootstrapSwitch({
      size: 'mini',
      state: user.autoPlay,
      onSwitchChange: onAutoPlayChange
    });

    notificationObject.notifiedUserId  = video.userId;
    notificationObject.actionUserId    = user._id;
  } else {
    $("[name='auto-play-input']").bootstrapSwitch({
      size: 'mini'
    });
  }

  bindEvents();

  //video description functions

  //initial slide down function for video description
  setTimeout(function() {
    $('#video-description').slideDown();
  }, 1000);

  //slide up function for description
  setTimeout(function() {
    var html = '<div class="show-more-description"><span class="glyphicon glyphicon-chevron-down"></span></div>';
    $('#video-description').slideUp();
    $('.description-container').append(html)
  }, 5000);

}

module.exports = {
  initialize: initialize
};