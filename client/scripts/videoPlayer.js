/* global fbq, ga */
/**
 * external lib
 */
var videojs = require('video.js');
var PubSub  = require('pubsub-js');
require('slick-carousel');
require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');
require('../../node_modules/video.js/dist/video-js.css');
require('../../node_modules/videojs-resolution-switcher/lib/videojs-resolution-switcher.css');
require('../../node_modules/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css');
require('videojs-resolution-switcher');
require('bootstrap-switch');

/**
 * Templates
 */
var commentsTpl = require('../templates/videoPlayer/comments.dust');

var AVEventTracker			               = require('./avEventTracker');
var identity                           = require('./services/identity');
var browser                            = require('./services/browser');
var amazonConfig                       = require('./config/amazon.config.client');
var dialog                             = require('./services/dialogs');
var userIdentity                       = identity;
var user                               = identity.currentUser;
var notificationObject                 = {};
var hasStartedPlaying                  = false;
var paused                             = false;
var followData                         = {};
var $videoPlayer;
var $videoPage;
var screenWidth;
var video;



var SLICK_CONFIG = {
  slidesToShow: 3,
  slidesToScroll: 1,
  draggable: false,
  nextArrow: '<button type="button" class="slick-next"><span class="glyphicon glyphicon-menu-right"></span></button>',
  prevArrow: '<button type="button" class="slick-prev"><span class="glyphicon glyphicon-menu-left"></span></button>',
  responsive: [
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1
      }
    },
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1
      }
    },
    {
      breakpoint: 768,
      settings: {
        arrows: false,
        swipeToSlide: true,
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
    ]
};
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

//get up next video info

//video increment
function incrementVideoCount() {
  var videoViewObject = {};
  videoViewObject.videoId = video._id;
  if(user) {
    videoViewObject.userId = user._id;
  }
  videoViewObject.videoOwnerId = video.userId;

  $.ajax({
      type: 'POST',
      url: '/api/videos/loaded',
      data: videoViewObject,
      dataType: 'json'
    })
    .done(function(response) {
    })
    .fail(function(error) {
    });
}

//check for user following and user video liked
function videoInfoCheck() {
  var checkObject = {};
  checkObject.userId = user._id;
  checkObject.videoId = video._id;
  checkObject.videoUserId = video.userId;

  $.ajax({
    type: 'GET',
    url: '/api/videos/videoInfoCheck',
    data: checkObject
  })
  .done(function(response) {
    if(response.like === true) {
      $('.like').addClass('airvuz-blue');
    }
    if(response.follow === true) {
      $('#follow').text('-');
    }
  })
  .fail(function(error) {
  });
}

function showLoginDialog() {
  PubSub.publish('show-login-dialog');
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
  .done(function(response) {
    user.autoPlay = response.autoPlay;
    identity.save();
  })
  .fail(function(error) {
  });
}

//bind events
function bindEvents() {

  //api calls

  //create comment and append
  $('#commentSave').on('click', function() {
    if (!$(this).prev().val()) {
      // if no comment text then prevent from doing anything
      return;
    }
    AVEventTracker({
      codeSource	: "videoPlayer",
      eventName		: "commentSave",
      eventType		: "click"
    });
    notificationObject.notificationType = 'COMMENT';
    notificationObject.notifiedUserId  = video.userId;
    notificationObject.notificationMessage = $('#comment-text').val();
    notificationObject.videoId = video._id;
    if(userIdentity.isAuthenticated()) {
      notificationObject.actionUserId = userIdentity._id;
    }
    var commentData = {};
    var comment = {};
    comment.videoId = $(this).attr('value');
    comment.comment = $('#comment-text').val();
    comment.userId = userIdentity._id;
    commentData.comment = comment;
    commentData.notification = notificationObject;
    $.ajax({
        type: 'POST',
        url: '/api/comment',
        data: {data: JSON.stringify(commentData)}
      })
      .done(function(data) {
        var comment = data;
        // TODO: use dust template rendering
        var html = '<li class="comment-wrap">'+
          '<div class="flex">'+
          '<img src="' + comment.userId.profilePicture + '" height="50" width="50" class="border-radius-circle m-10-20">'+
          '<div class="m-t-20">'+
          '<p class="pos-absolute-r-15" datetime="' + comment.commentCreatedDate + '"></p>'+
          '<p class="m-b-0 airvuz-blue">' + comment.userId.userNameDisplay + '</p>'+
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
        var currentCount = $('.comment-count').text();
        var toNumber = Number(currentCount);
        $('.comment-count').text('  ' + (toNumber + 1) + '  ');

        fbq('trackCustom', 'comment');
        ga('send', 'event', 'video page', 'comment', 'commenting video');
      });
  });

  //video like
  $('.like').on('click', function() {
    if(userIdentity._id && userIdentity._id !== video.userId) {
      notificationObject.notificationType = 'LIKE';
      notificationObject.notifiedUserId  = video.userId;
      notificationObject.notificationMessage = 'liked your video';
      notificationObject.videoId = video._id;
      if(userIdentity.isAuthenticated()) {
        notificationObject.actionUserId = userIdentity._id;
      }
      var likeData = {};
      var likeObject = {};
      likeObject.videoId = $(this).attr('data-videoId');
      likeObject.userId = userIdentity._id;
      likeObject.videoOwnerId = video.userId;
      likeData.like = likeObject;
      likeData.notification = notificationObject;

      $.ajax({
          type: 'POST',
          url: '/api/video-like',
          data: {data: JSON.stringify(likeData)},
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
            $('.like-count').text(likeLog + 1);
            fbq('trackCustom', 'like');
          } else if (response.status === 'unliked') {
            AVEventTracker({
              codeSource	: "videoPlayer",
              eventName		: "videoUnliked",
              eventType		: "click"
            });
            $('.like').removeClass('airvuz-blue');
            $('.like-count').text(likeLog - 1);
            fbq('trackCustom', '-like');
          }

          ga('send', 'social', 'facebook', 'like', window.location.href);
          ga('send', 'event', 'video page', 'facebook like', 'like video');
        })
        .fail(function (error) {
        });
    } else if(!userIdentity.isAuthenticated()) {
      showLoginDialog();
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
      .fail(function(error) {
      });
  });

  //follow video user
  $('#follow').on('click', function() {
    if(userIdentity._id && userIdentity._id !== video.userId) {
      var followObject = {};
      followObject.userId = userIdentity._id;
      followObject.followingUserId = video.userId;
      notificationObject.notificationType = 'FOLLOW';
      notificationObject.notifiedUserId  = video.userId;
      notificationObject.notificationMessage = 'started following you';
      if(userIdentity.isAuthenticated()) {
        notificationObject.actionUserId = userIdentity._id;
      }
      followData.follow = followObject;
      followData.notification = notificationObject;

      if ($(this).text() === '-') {
        dialog.open({
          title: 'Unfollow',
          body: 'Are you sure you want to unfollow this person?',
          showOkay: true
        }).then(function () {
          xhrFollowUser(followData);
        });
      } else {
        xhrFollowUser(followData);
      }

    } else if(!userIdentity.isAuthenticated()) {
      showLoginDialog();
    } else {
      $('#follow-self-modal').modal('show');
    }
  });

  /*
   * make the request to follow or unfollow the person
   * @param {Object} data - follow data
   */
  function xhrFollowUser (data) {
    $.ajax({
      type: 'POST',
      url: '/api/follow',
      data: {data: JSON.stringify(data)}
    })
        .done(function (response) {
          if(response.status === 'followed') {
            AVEventTracker({
              codeSource	: "videoPlayer",
              eventName		: "followedUser",
              eventType		: "click"
            });
            $('#follow').text('-');
            fbq('trackCustom', 'follow');
          } else if(response.status === 'unfollowed'){
            AVEventTracker({
              codeSource	: "videoPlayer",
              eventName		: "unfollowedUser",
              eventType		: "click"
            });
            $('#follow').text('+');
            fbq('trackCustom', '-follow');
          }

          ga('send', 'event', 'video page', 'following', 'following user');
        })
        .fail(function (error) {
        })
  }

  //facebook modal event
  $('#facebook').click(function(e){
    e.preventDefault();
    FB.ui(
      {
        method: 'feed',
        name: video.name,
        link: window.location.href,
        picture: 'http://s3-us-west-2.amazonaws.com/' + amazonConfig.OUTPUT_BUCKET + '/'+video.thumbnailPath,
        description: video.description,
        message: ""
      },
      function(response) {
        notificationObject.notificationType = 'SOCIAL-MEDIA-SHARE-FACEBOOK';
        notificationObject.notificationMessage = 'shared your video on Facebook';
        notificationObject.notifiedUserId  = video.userId;
        notificationObject.videoId = video._id;
        if(userIdentity.isAuthenticated()) {
          notificationObject.actionUserId = userIdentity._id;
        }
        if(response.post_id) {
          $.ajax({
            type: 'POST',
            url: '',
            data: notificationObject
          })
          .done(function(response) {
            fbq('trackCustom', 'social-share-facebook');
            ga('send', 'social', 'facebook', 'share', window.location.href);
            ga('send', 'event', 'video page', 'facebook share', 'sharing video');
          })
          .fail(function(error) {
          });
        }
      }
    );
  });

  $('#twitter').on('click', function() {
    notificationObject.notificationType = 'SOCIAL-MEDIA-SHARE-TWITTER';
    notificationObject.notificationMessage = 'shared your video on Twitter';
    notificationObject.videoId = video._id;
    notificationObject.notifiedUserId  = video.userId;
    if(userIdentity.isAuthenticated()) {
      notificationObject.actionUserId = userIdentity._id;
    }
    $.ajax({
      type: 'POST',
      url: '/api/notifications',
      data: notificationObject
    })
    .done(function(response) {
      fbq('trackCustom', 'social-share-twitter');
      ga('send', 'social', 'twitter', 'share', window.location.href);
      ga('send', 'event', 'video page', 'twitter share', 'sharing video');
    })
    .fail(function(error) {
    })
  });

  $('#google').on('click', function() {
    notificationObject.notificationType = 'SOCIAL-MEDIA-SHARE-GOOGLEPLUS';
    notificationObject.notificationMessage = 'shared your video on Google Plus';
    notificationObject.videoId = video._id;
    notificationObject.notifiedUserId  = video.userId;
    if(userIdentity.isAuthenticated()) {
      notificationObject.actionUserId = userIdentity._id;
    }
    $.ajax({
        type: 'POST',
        url: '/api/notifications',
        data: notificationObject
      })
      .done(function(response) {
        fbq('trackCustom', 'social-share-google');
        ga('send', 'social', 'google', 'share', window.location.href);
        ga('send', 'event', 'video page', 'google share', 'sharing video');
      })
      .fail(function(error) {
      });
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
    notificationObject.notificationType = 'SOCIAL-MEDIA-SHARE-EMBEDED';
    notificationObject.notifiedUserId  = video.userId;
    notificationObject.notificationMessage = 'embeded your video';
    notificationObject.videoId = video._id;
    if(userIdentity.isAuthenticated()) {
      notificationObject.actionUserId = userIdentity._id;
    }
    $.ajax({
        type: 'POST',
        url: '/api/notifications',
        data: notificationObject
      })
      .done(function(response) {
        fbq('trackCustom', 'social-share-embed');
        ga('send', 'event', 'video page', 'embeding', 'embeding video');
      })
      .fail(function(error) {
      });
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
  $('#comment-text').on('click', checkIdentitiy);

  //start player event delegation
    function endFunction() {
      AVEventTracker({
        codeSource: "videoPlayer",
        eventName: "ended",
        eventType: "playerEvent"
      });
      if(!user || user.autoPlay === true) {

        //set poster to next video image
        var nextVideo = $('.nextVideos').children('ul').children().first();
        var picture = nextVideo.find('img').attr('src');
        var nextTitle = nextVideo.attr('data-title');

        //set countdown variables
        var countdownNumber = Number(10);
        var activeEl = null;

        //set layer html
        var html = '<p class="end-card-upnext">UP NEXT</p>'+
                   '<p class="end-card-title">' + nextTitle + '</p>'+
                   '<p class="end-card-countdown">' + countdownNumber + '</p>'+
                   '<button class="btn btn-primary pause-countdown">Pause Countdown</button>';

        //run function to change poster
        $('.vjs-poster').attr('style', 'background-image: url("' + picture + '")');

        //show poster
        this.hasStarted(false);
        this.bigPlayButton.hide();

        //setting up end card layer
        var endCardLayer = $('#video-player div:nth-child(2)');

        //adding layer html
        endCardLayer.first().addClass('video-end-card');

        //setting layer html
        endCardLayer.html(html);

        //setting countdown pause on comment focus
        $(document).on('click', function() {
          activeEl = $(document.activeElement).attr('id');
        });

        //setting countdown interval variable function
        var countdown = function() {
          if(countdownNumber !== 0) {
            if (activeEl !== 'comment-text' && paused !== true) {
              countdownNumber = countdownNumber - 1;
              $('.end-card-countdown').text(countdownNumber);
            } else {
              clearInterval(countdown);
            }
          } else {
            window.location.href = nextVideo.attr('value');
          }
        };
        //calling interval variable
        setInterval(countdown, 1000);
      } else {
        this.hasStarted(false);
      }
    }

    function timeFunction() {
      if(hasStartedPlaying) {
        AVEventTracker({
          codeSource	: "videoPlayer",
          eventName		: "buffering",
          eventType		: "playerEvent"
        });
      }
    }

    function playFunction() {
      hasStartedPlaying = true;
      AVEventTracker({
        codeSource	: "videoPlayer",
        eventName		: "playing",
        eventType		: "playerEvent"
      });
    }

    function pauseFunction() {
      AVEventTracker({
        codeSource	: "videoPlayer",
        eventName		: "paused",
        eventType		: "playerEvent"
      });
    }

    videojs("video-player").ready(function() {
      var player = this;
      player
      .on('playing', playFunction)
      .on('ended', endFunction)
      .on('waiting', timeFunction)
      .on('pause', pauseFunction);
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
      var replyData = {};
      var replyObject = {};
      replyObject.comment = $('#comment').val();
      replyObject.parentCommentId = parentCommentId;
      replyObject.userId = userIdentity._id;
      replyObject.videoId = video._id;
      notificationObject.notifiedUserId = $('#saveComment').parent().parent().attr('data-userid');
      notificationObject.notificationType = 'COMMENT REPLY';
      notificationObject.notificationMessage = $('#comment').val();
      notificationObject.videoId = video._id;
      if(userIdentity.isAuthenticated()) {
        notificationObject.actionUserId = userIdentity._id;
      }
      replyData.comment = replyObject;
      replyData.notification = notificationObject;

      $.ajax({
          type: 'POST',
          url: '/api/comment',
          data: {data: JSON.stringify(replyData)},
          dataType: 'json'
        })
        .done(function(reply) {
          //insert comment on DOM
          var html = '<div class="flex">'+
            '<img src="' + reply.userId.profilePicture + '" height="30" width="30" class="border-radius-circle m-10-20">'+
            '<div class="m-t-10">'+
            '<p class="pos-absolute-r-15" datetime="' + reply.commentCreatedDate + '"></p>'+
            '<p class="m-b-0 airvuz-blue">' + reply.userId.userNameDisplay + '</p>'+
            '<p class="m-b-0">' + reply.comment + '</p>'+
            '</div>'+
            '</div>';

          $(self).parents('.comment-wrap').find('.parentComment').append(html);
          $('.commentBox').remove();
          $('.reply').show();
          var currentCount = $('.commentCount').text();
          var toNumber = Number(currentCount);
          $('.commentCount').text('  ' + (toNumber + 1) + '  ');

          fbq('trackCustom', 'comment');
          ga('send', 'event', 'video page', 'comment', 'commenting video');
        });
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
            '<img src="' + reply.userId.profilePicture + '" height="30" width="30" class="border-radius-circle m-10-20">'+
            '<div class="m-t-10">'+
            '<p class="pos-absolute-r-15" datetime="' + reply.commentCreatedDate + '"></p>'+
            '<p class="m-b-0 airvuz-blue">' + reply.userId.userNameDisplay + '</p>'+
            '<p class="m-b-0">' + reply.comment + '</p>'+
            '</div>'+
            '</div>' +
            '</li>'
        });

        //append child elements to DOM
        $(self).parents('.comment-wrap').find('.parentComment').append(html);
        if(data.length === 10) {
          html = '<div class="row m-t-10" style="text-align: center"><span><a class="moreReplies" value="'+parentId+'">load More</a></span></div>';
          $(self).parent().siblings().append(html);
          $(self).hide();
        } else {
          $(self).hide();
        }
      })
  }

  //description functions
  function moreDescription() {
    $('#video-description').slideDown();
    $(this).hide();
    $('.show-less-description').show();
  }

  function lessDescription() {
    $('#video-description').slideUp();
    $(this).hide();
    $('.show-more-description').show();
  }

  function checkIdentitiy() {
    if(!userIdentity.isAuthenticated()) {
      showLoginDialog();
    }
  }

  function pauseCountdown() {
      paused = true;
      $(this).addClass('countdown-paused');
      $(this).removeClass('pause-countdown');
      $(this).text('Start Countdown')
  }

  function startCountdown() {
      paused = false;
      $(this).addClass('pause-countdown');
      $(this).removeClass('countdown-paused');
      $(this).text('Pause Countdown')
  }

  var showMoreComments = function () {
    $.ajax({
      type: 'GET',
      url: '/api/comment/byVideo?page=' + showMoreComments.page + '&videoId=' + video._id,
      dataType: 'json'
    }).done(function (response) {
      commentsTpl({comments: response}, function (err, html) {
        $videoPage.find('.parent-comments').append(html);
      });
      if (response.length < 10) {
        $videoPage.find('#btn-view-more-comments').addClass('hidden');
      }
      showMoreComments.page += 1;
    })
  };

  showMoreComments.page = 2;


  ///////////////////////////////////////

  $videoPage
    .on('click', '.show-more-description', moreDescription)
    .on('click', '.show-less-description', lessDescription)
    .on('click', '.commentReplies', commentReplies)
    .on('click', '.reply', commentReply)
    .on('click', '#comment', checkIdentitiy)
    .on('click', '#btn-view-more-comments', showMoreComments)
    .on('click', '.countdown-paused', startCountdown)
    .on('click', '.pause-countdown', pauseCountdown);

}

//page init function
function initialize(videoPath, currentVideo) {
  video = currentVideo;
  var defaultRes = '300',
      browserWidth = browser.getSize().width;

  if (browser.isMobile()) {
    defaultRes = '200';
  } else {
    switch(true) {
      case (browserWidth < 768):
        defaultRes = '200';
        break;
      case (browserWidth < 992):
        // default
        defaultRes = '300';
        break;
      // res 400 is an option and should not be force
      // case (browserWidth < 1200):
      //   defaultRes = '400';
      //   break;
    }
  }

  videojs('video-player', {
    plugins: {
      videoJsResolutionSwitcher: {
        default: defaultRes
      }
    }
  }, function () {
    var player = this,
        videoSrc = videoPath,
        videoType = 'video/mp4';

    player.updateSrc([
      {
        src: videoSrc.replace('.mp4', '-100.mp4'),
        type: videoType,
        label: 'low',
        res: '100'
      },
      {
        src: videoSrc.replace('.mp4', '-200.mp4'),
        type: videoType,
        label: 'med',
        res: '200'
      },
      {
        src: videoSrc,
        type: videoType,
        label: 'original',
        res: '300'
      }, {
        src: videoSrc.replace('.mp4', '-400.mp4'),
        type: videoType,
        label: 'high',
        res: '400'
      }
    ]);
  });
  //set video page
  $videoPage = $('.video-page');
  $videoPlayer = $('#video-player');

  $('.video-slick').slick(SLICK_CONFIG);
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
  } else {
    $("[name='auto-play-input']").bootstrapSwitch({
      size: 'mini'
    });
  }

  bindEvents();

  if (!browser.isMobile()) {
    $('[data-toggle="tooltip"]').tooltip();
  }

  //video description functions

  //slide up function for description
  setTimeout(function() {
    $('.show-more-description span').removeClass('invisible');
    $('#video-description').slideUp();
  }, 5000);

  ga('send', 'event', 'video page', 'viewing', 'viewing video');
}

module.exports = {
  initialize: initialize
};