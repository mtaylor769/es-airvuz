/* global fbq, ga */
/**
 * external lib
 */
var videojs = require('video.js');
var PubSub  = require('pubsub-js');
var moment = require('moment');
require('slick-carousel');
require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');
require('../../node_modules/video.js/dist/video-js.css');
require('../../node_modules/videojs-resolution-switcher/lib/videojs-resolution-switcher.css');
require('../../node_modules/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css');
require('videojs-resolution-switcher');
require('bootstrap-switch');
require('./plugins/video-switcher');

/**
 * Templates
 */
var commentsTpl = require('../templates/videoPlayer/comments.dust');
var repliesTpl = require('../templates/videoPlayer/replies.dust');
var videoSocialShareTpl = require('../templates/social/videoSocialShare.dust');
var categoriesPartialTpl = require('../templates/videoPlayer/categoriesPartial.dust');
var videoOwnerPartialTpl = require('../templates/videoPlayer/videoOwnerPartial.dust');
var videoInfoPartialTpl = require('../templates/videoPlayer/videoInfoPartial.dust');
var videoUserSlickPartialTpl = require('../templates/videoPlayer/videoUserSlickPartial.dust');
var videoNextVideosPartialTpl = require('../templates/videoPlayer/videoNextVideosPartial.dust');
var videoHasMorePartialTpl = require('../templates/videoPlayer/videoHasMorePartial.dust');
var videoMobileTabPartialTpl = require('../templates/videoPlayer/videoMobileTabPartial.dust');

var AVEventTracker			           = require('./avEventTracker');
var identity                           = require('./services/identity');
var browser                            = require('./services/browser');
var amazonConfig                       = require('./config/amazon.config.client');
var dialog                             = require('./services/dialogs');
var videoSocialShare                   = require('./services/videoSocialShare');
var userIdentity                       = identity;
var user                               = identity.currentUser;
var notificationObject                 = {};
var hasStartedPlaying                  = false;
var paused                             = false;
var followData                         = {};
var isPlaying                          = false;
var bufferCount                        = 2;
var hasResChange                       = false;
var bufferInterval                     = null;
var isSeeking                          = false;
var startViewCount                     = true;
var initialPlayStart                   = false;
var canResetShowMoreCount              = false;
var countDownInterval                  = null;
var $videoPlayer;
var $videoPage;
var screenWidth;
var video;
var VideoPlayer;
var videoPathSrc;

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

// Capture event on next video playlist
function nextVideoHandler(evt) {
    evt.preventDefault();

    ga('send', 'event', 'video page', 'video-up-next-video-clicked', 'viewing video');
    AVEventTracker({
        codeSource: 'videoPlayer',
        eventName: 'video-up-next-video-clicked',
        eventType: 'click',
        videoId: video._id
    });
    // Config parameters
    var CONFIG = {
        selectedVideoId: $(this).attr('id')
    };
    // reset the initialPlayStart start flag to capture the play start event
    initialPlayStart = false;
    $(this).switchVideo(CONFIG);
}

function tabHandler(evt) {
    var tabDataId = $(this).attr('data-id');

    switch(tabDataId) {
        case 'upNext':
            $('#next').show();
            $('.mobile-tab-body').hide();
            $('.comments-wrapper').hide();
            break;
        case 'description':
            $('.mobile-tab-body').show();
            $('#next').hide();
            $('.comments-wrapper').hide();
            break;
        case 'comments':
            $('.comments-wrapper').show();
            $('.mobile-tab-body').hide();
            $('#next').hide();
            break;
    }
}

PubSub.subscribe('video-switched', function (msg, data) {
    // update the current video object
    video = data;

    // update the videopath src
    videoPathSrc = amazonConfig.OUTPUT_URL + data.videoPath;
    updateVideoSrc();

    // reset the flag
    startViewCount = true;

    // stop the count down timer
    if (countDownInterval !== null) {
        clearInterval(countDownInterval);
        $('#video-player div:nth-child(2)').removeClass('video-end-card').empty();
    }

    // update video title
    $('.video-player-title').empty();
    $('.video-player-title').html(video.title);

    var getUserProfile = $.ajax({type: 'GET', url: '/api/video/videoOwnerProfile/' + video.userId}),
        getComments = $.ajax({type: 'GET', url: '/api/videos/videoComments/' + video._id}),
        getTopSixVid = $.ajax({type: 'GET', url: '/api/videos/topSixVideos/' + video.userId}),
        getFollowCount = $.ajax({type: 'GET', url: '/api/videos/followCount/' + video.userId}),
        getVideoCount = $.ajax({type: 'GET', url: '/api/videos/videoCount/' + video.userId}),
        getNextVideos = $.ajax({type: 'POST', url: '/api/videos/nextVideos', data: video.categories[0]});

    // make parallel requests
    $.when(
        getUserProfile,
        getComments,
        getTopSixVid,
        getFollowCount,
        getVideoCount,
        getNextVideos
    ).done(function(userData, commentsData, topSixVidData, followCountData, videoCountData, nextVideosData) {
        // update next video lists template
        $(nextVideosData[0]).each(function(idx, vid) {
           vid.s3Bucket = amazonConfig.OUTPUT_URL;
        });
        videoNextVideosPartialTpl({upNext: nextVideosData[0]}, function (err, html) {
            $('.next-video-list').empty();
            $('.next-video-list').prepend(html);
        });

        // mobile tabs
        videoMobileTabPartialTpl({video: video}, function (err, html) {
            $('.mobile-tab-container').empty();
            $('.mobile-tab-container').prepend(html);
        });

        // update the comments template
        commentsTpl({comments: commentsData[0], canEdit: true}, function (err, html) {
            $('.parent-comments').empty();
            $('.parent-comments').prepend(html);
        });

        // update the has more button template
        videoHasMorePartialTpl({hasMoreComments: video.commentCount > commentsData[0].length}, function (err, html) {
            $('.more-comments-container').empty();
            $('.more-comments-container').prepend(html);

            canResetShowMoreCount = true;

            setCommentOptions();
        });

        // update categories
        categoriesPartialTpl({video: video}, function (err, html) {
            $('.video-player-categories').empty();
            $('.video-player-categories').prepend(html);
        });

        // update videoOwner template
        userData[0].followCount = followCountData[0];
        userData[0].videoCount = videoCountData[0];

        // top six videos
        var topSixVid = [];
        $(topSixVidData[0]).each(function (idx, vid) {
            vid.s3Bucket = amazonConfig.OUTPUT_URL;
            if (vid._id.toString() !== data._id) {
                topSixVid.push(vid);
            }
        });

        // update user video slider
        videoUserSlickPartialTpl({topVideos: topSixVid}, function (err, html) {
            $('.slick-slide').remove();
            $('.video-slick').slick('slickAdd', html);
        });

        // update video owner info
        videoOwnerPartialTpl({user: userData[0]}, function (err, html) {
            $('.video-user-container').empty();
            $('.video-user-container').prepend(html);

            videoInfoCheck();
            setCommentOptions();
        });
    });
    // update video info
    videoInfoPartialTpl({video: data}, function (err, html) {
        $('.video-info').empty();
        $('.video-info').prepend(html);
        $('.video-info').tooltip({
            selector: "[data-toggle='tooltip']"
        });
    });

    // render the social icons
    videoSocialShareTpl({video: video}, function (err, html) {
        $('.social-icons-container').empty(html);
        $('.social-icons-container').prepend(html);
        videoSocialShare.setIconFontSize('sm');
        videoSocialShare.addClass('vertical-align');
        videoSocialShare.removeColorOnHover(true);
        videoSocialShare.initialize(video);
    });

    //slide up function for description
    if ($( window ).width() >= 768) {
        setTimeout(function() {
            $('.show-more-description span').removeClass('invisible');
            $('#video-description').slideUp();
        }, 5000);
    }

    // set the virtual page view tracking
    ga('set', 'page', document.location.pathname);
    ga('send', 'pageview');
});

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
    });
}

function checkCommentForDelete(userId) {
  var _comments = $('.parent-comments').children();
  $.each(_comments, function(index, comment) {
    var optionList = $(this).children().find('.comment-options-selection');
    var commentUser = $(this).attr('data-userid');
    var html;
    if(userId === commentUser) {
      html = '<li class="delete-comment">Delete</li><li class="edit-comment">Edit</li>';
    } else {
      html = '<li class="report-comment">Report Comment</li>';
    }
    optionList.empty();
    optionList.append(html);
  });
}

function showOptions() {
  $('.comment-options-box').not($(this).siblings()).hide();
  $(this).siblings().toggle();
}

//check for user following and user video liked
function videoInfoCheck() {
    if(userIdentity.isAuthenticated()) {
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
            } else {
                $('#follow').text('+');
            }
        });
    } else {
        $('#follow').text('+');
    }
}

function showLoginDialog() {
  PubSub.publish('show-login-dialog');
}

//function to persist autoplay data
function onAutoPlayChange(event, state) {
  var autoPlayObject = {};
  autoPlayObject.userId = user._id;
  autoPlayObject.autoPlay = state;

  AVEventTracker({
    codeSource: 'videoPlayer',
    eventName: 'video-auto-play',
    eventType: 'click',
    videoId: video._id
  });

  $.ajax({
    type:'PUT',
    url: '/api/users/' + user._id,
    data: autoPlayObject
  })
  .done(function(response) {
    user.autoPlay = response.data.autoPlay;
    identity.save();
  })
  .fail(function(error) {
  });
}

//bind events
function bindEvents() {

  //api calls
  function deleteComment() {
    var _deleteCommentId = $(this).parent().attr('data-commentId');
    var commentParentId = '#' + _deleteCommentId;
    var _deleteComment = $(this).parents().find(commentParentId);
    $.ajax({
      type: 'DELETE',
      url:'/api/comment/' + _deleteCommentId
    })
      .done(function(response) {
        _deleteComment.remove();
      })
      .fail(function(error) {
      })
  }

  function reportComment() {
    var data = {};
    data.commentId = $(this).parent().attr('data-commentid');
    $(this).parent().parent().toggle();
    $.ajax({
      type: 'POST',
      url: '/api/comment/report/',
      data: data
    })
    .done(function(response) {
    })
    .fail(function(error) {
    })
  }

  function editComment() {
    var commentId = $(this).parent().attr('data-commentId');
    var commentText = $(this).parent().parent().parent().siblings('.comment-text').text();
    $('#comment-edit-modal').children().find('#comment-edit-textarea').val(commentText);
    $(this).parent().parent().toggle();
    $('#comment-edit-modal').modal('show');
    $('#edit-save-comment').one('click', function() {
      commentText = $(this).parent().siblings('.modal-body').children().val();
      saveEditComment(commentId, commentText);
    })
  }

  function saveEditComment(commentId, comment) {
    var data = {};
    data.comment = comment;

    $.ajax({
      type: 'PUT',
      url: '/api/comment/' + commentId,
      data: data
    })
    .done(function(response) {
      var commentChangedId = '#' + response._id;
      $(commentChangedId).children().find('.comment-options-wrapper').first().siblings('.comment-text').text(response.comment);
      $('#comment-edit-modal').modal('hide');
    })
    .fail(function(error) {

    })
  }

  //create comment and append
  function commentSaveHandler() {
      if (!$(this).prev().val()) {
          // if no comment text then prevent from doing anything
          return;
      }
      AVEventTracker({
          codeSource: 'videoPlayer',
          eventName: 'comment-saved',
          eventType: 'click',
          videoId: video._id
      });
      ga('send', 'event', 'video page', 'comment-saved', 'commenting video');
      notificationObject.notificationType = 'COMMENT';
      notificationObject.notifiedUserId  = video.userId;
      notificationObject.notificationMessage = $('#comment-text').val();
      notificationObject.videoId = video._id;
      if(userIdentity.isAuthenticated()) {
          notificationObject.actionUserId = userIdentity._id;
      }
      var commentData = {};
      var comment = {};
      comment.videoId = video._id;
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
              comment.commentDisplayDate = moment(comment.commentCreatedDate).fromNow();
              commentsTpl({comments: [comment], canEdit: true}, function (err, html) {
                  $('.parent-comments').prepend(html);
              });

              $('#comment-text').val('');
              var currentCount = $('.comment-count').text();
              var toNumber = Number(currentCount);
              $('.comment-count').text('  ' + (toNumber + 1) + '  ');

              fbq('trackCustom', 'comment');
              ga('send', 'event', 'video page', 'comment', 'commenting video');
          });
  }

  //video like
  function likeHandler() {
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
          likeObject.videoId = video._id;
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
                          codeSource: 'videoPlayer',
                          eventName: 'video-liked',
                          eventType: 'click',
                          videoId: video._id
                      });
                      $('.like').addClass('airvuz-blue');
                      $('.like-count').text(likeLog + 1);
                      fbq('trackCustom', 'like');
                  } else if (response.status === 'unliked') {
                      AVEventTracker({
                          codeSource: 'videoPlayer',
                          eventName: 'video-unliked',
                          eventType: 'click',
                          videoId: video._id
                      });
                      $('.like').removeClass('airvuz-blue');
                      $('.like-count').text(likeLog - 1);
                      fbq('trackCustom', '-like');
                  }

                  ga('send', 'social', 'facebook', 'like', window.location.href);
                  ga('send', 'event', 'video page', 'facebook-like', 'like video');
              })
              .fail(function (error) {
              });
      } else if(!userIdentity.isAuthenticated()) {
          showLoginDialog();
      } else {
          $('#like-self-modal').modal('show');
      }
  }

  //send report video info
  $('#send-report').on('click', function() {
    var reportData = {};
    reportData.videoId = $(this).attr('data-videoid');
    reportData.message = $('.report-text').val();
    reportData.userId = userIdentity._id;
    $.ajax({
        type: 'POST',
        url: '/api/videos/report-video',
        data: reportData,
        beforeSend: function () {
          $('#send-report').prop('disabled', true);
        }
      })
      .done(function(response) {
        $('#report-modal').modal('hide');
        $('.report-text').val('');
      })
      .fail(function(error) {
      })
  });

  $('.report-text').keyup(function() {
    var hasText = $(this).val().length ? false : true;

    $('#send-report').prop('disabled', hasText);
  });

  //follow video user
  function followUserHandler() {
      if(userIdentity._id && userIdentity._id !== video.userId) {
          var followObject = {};
          followObject.userId = userIdentity._id;
          followObject.followingUserId = video.userId;
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
  }

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
            ga('send', 'event', 'video page', 'video-following-user', 'following user');
            AVEventTracker({
              codeSource: 'videoPlayer',
              eventName: 'video-following-user',
              eventType: 'click',
              videoId: video._id
            });
            $('#follow').text('-');
            fbq('trackCustom', 'follow');
          } else if(response.status === 'unfollowed'){
            ga('send', 'event', 'video page', 'video-unfollowing-user', 'following user');
            AVEventTracker({
              codeSource: 'videoPlayer',
              eventName: 'video-unfollowing-user',
              eventType: 'click',
              videoId: video._id
            });
            $('#follow').text('+');
            fbq('trackCustom', '-follow');
          }
        })
        .fail(function (error) {
        })
  }
  //share toggle
  function shareHandler() {
      if (browser.isMobile()) {
          $('#social-modal').modal('show');
      } else {
          $('.social-icons').toggle();
      }
  }

  //report modal
  function reportVideoHandler() {
      if (userIdentity.isAuthenticated()) {
          $('#report-modal').modal('show');
      } else {
          showLoginDialog();
      }
  }

  //go to previous page
  $('.page-back').on('click', function() {
    window.history.back();
  });

  //comment modal
  $('#comment-text').on('click', checkIdentitiy);

  //start player event delegation
    function endFunction() {
      ga('send', 'event', 'video page', 'video-ended', 'viewing video');
      AVEventTracker({
        codeSource: 'videoPlayer',
        eventName: 'video-ended',
        eventType: 'playerEvent',
        videoId: video._id
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
            if (activeEl !== 'comment-text' && paused !== true && $('#comment-text').val().length === 0) {
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
        countDownInterval = setInterval(countdown, 1000);
      } else {
        this.hasStarted(false);
      }
    }

    function timeFunction() {
      if(hasStartedPlaying) {

        // Buffering usually happens after seeking, we don't want to capture that buffer event
        if (isSeeking) return;

        AVEventTracker({
          codeSource: 'videoPlayer',
          eventName: 'buffering',
          eventType: 'playerEvent'
        });

        if (!hasResChange) {
          bufferInterval = setInterval(bufferIntervalTimer(), 1000);
        } else {
          if (bufferInterval !== null) {
            clearInterval(bufferInterval);
          }
        }
      }
    }

    function playFunction() {
      hasStartedPlaying = true;
      isPlaying = true;
      isSeeking = false;

      // increment view count on start once
      if (startViewCount) {
        startViewCount = false;
        incrementVideoCount();
        viewTracking();
      }

      fbq('trackCustom', 'video-playing');
      ga('send', 'event', 'video page', (browser.isMobile() ? 'm-video-playing' : 'video-playing'), 'viewing video');
      AVEventTracker({
        codeSource: 'videoPlayer',
        eventName: 'video-playing',
        eventType: 'playerEvent',
        videoId: video._id
      });
    }

    function pauseFunction() {
      var player = $videoPlayer[0].player;
      isPlaying = false;
      if (player.scrubbing()) return;

      ga('send', 'event', 'video page', (browser.isMobile() ? 'm-video-paused' : 'video-paused'), 'viewing video');
      AVEventTracker({
        codeSource: 'videoPlayer',
        eventName: 'video-paused',
        eventType: 'playerEvent',
        videoId: video._id
      });
    }

    function bufferIntervalTimer () {
      bufferCount--;
      if (bufferCount <= 0) {
        bufferCount = 2;
        if (!hasResChange) {
          videoResChangeOnBuffering();
        }
      }
    }

    // change the video resolution during buffering
    function videoResChangeOnBuffering() {
      var player = $videoPlayer[0].player,
          playerResolution = player.currentResolution().label;

      if (player.readyState() !== 0) {
        if (browser.isMobile()) {
          player.currentResolution('low');

          hasResChange = true;

          ga('send', 'event', 'video page', 'mobile video resolution changed on buffering', 'viewing video');
          AVEventTracker({
            codeSource: 'videoPlayer',
            eventName: 'videoResolutionChangedOnBuffering',
            eventType: 'browser',
            videoId: video._id
          });
        }
      }
    }

    function seekFunction() {
      if (!isSeeking) {
        isSeeking = true;

        ga('send', 'event', 'video page', 'video-seeking', 'viewing video');
        AVEventTracker({
          codeSource: 'videoPlayer',
          eventName: 'video-seeking',
          eventType: 'playerEvent',
          videoId: video._id
        });
      }
    }

    // track when the video intially starts to play
    function initialPlayFunction () {
      if (!initialPlayStart) {
        initialPlayStart = true;

        ga('send', 'event', 'video page', (browser.isMobile() ? 'm-video-play-start' : 'video-play-start'), 'viewing video');
        AVEventTracker({
          codeSource: 'videoPlayer',
          eventName: 'video-play-start',
          eventType: 'click',
          videoId: video._id
        });
      }
    }

    videojs("video-player").ready(function() {
      var player = this;
      player
      .on('play', initialPlayFunction)
      .on('playing', playFunction)
      .on('ended', endFunction)
      // .on('waiting', timeFunction) // Note: comment out for now until Buffering is figured out.
      .on('pause', pauseFunction)
      .on('seeking', seekFunction);

      /*
       * IOS fallback to native controls
       * Remove the video controls attr to prevent native control
       */
      if (browser.isIOS()) {
        removeVideoControlsAttr();
        player.on('touchend', function() {
          player.play();
        });
      }
    });

  /*
   * Remove videojs HTML5 video controls attribute
   */
  function removeVideoControlsAttr() {
    var html5VideoId = document.getElementById('video-player_html5_api');

    if (typeof html5VideoId !== 'undefined' && html5VideoId.hasAttribute('controls')) {
      html5VideoId.removeAttribute('controls');
    }
  }

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
          reply.commentDisplayDate = moment(reply.commentCreatedDate).fromNow();

          repliesTpl({replies: [reply], optionHtml: true}, function(error, html) {
            $(self).parents('.comment-wrap').find('.parentComment').append(html);
          });

          $('.commentBox').remove();
          $('.reply').show();
          var currentCount = $('.commentCount').text();
          var toNumber = Number(currentCount);
          $('.commentCount').text('  ' + (toNumber + 1) + '  ');

          fbq('trackCustom', 'video-commented');
          ga('send', 'event', 'video page', 'video-commented', 'commenting video');
          AVEventTracker({
            codeSource: 'videoPlayer',
            eventName: 'video-commented',
            eventType: 'browser',
            videoId: video._id
          });
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
      .done(function(replies) {
        replies.sort(function(a,b) {
          if(a.commentCreatedDate > b.commentCreatedDate) {
            return 1;
          }
          if(a.commentCreatedDate < b.commentCreatedDate) {
            return -1;
          }
          return 0;
        });
        //create child comment DOM elements
        var replyArray = [];
        replies.forEach(function(reply) {
          reply.optionHtml = userIdentity.isAuthenticated() && reply.userId._id === user._id;
          replyArray.push(reply);
        });

        $(self).parents('.comment-wrap').find('.parentComment').children().remove();

        repliesTpl({replies: replyArray}, function(error, html) {
          $(self).parents('.comment-wrap').find('.parentComment').append(html);
        });

        //append child elements to DOM
        if(replies.length === 10) {
          // value attribute should be data-value | data-parent-id
          var html = '<div class="row m-t-10" style="text-align: center"><span><a class="moreReplies" value="'+parentId+'">load More</a></span></div>';
          $(self).parent().siblings().append(html);
        }
        $(self).hide();
      });
  }

  function descriptionToggleHandler() {
    if ($('#video-description').is(':visible')) {
        $('#video-description').slideUp();
        $('.show-less-description').hide();
        $('.show-more-description').show();
    } else {
        $('#video-description').slideDown();
        $('.show-less-description').show();
        $('.show-more-description').hide();
    }
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
    if (canResetShowMoreCount) {
        canResetShowMoreCount = false;
        showMoreComments.page = 2;
    }
    $.ajax({
      type: 'GET',
      url: '/api/comment/byVideo?page=' + showMoreComments.page + '&videoId=' + video._id,
      dataType: 'json'
    }).done(function (response) {
      commentsTpl({comments: response}, function (err, html) {
        $videoPage.find('.parent-comments').append(html);
        setCommentOptions();
      });
      if (response.length < 10) {
        $videoPage.find('#btn-view-more-comments').addClass('hidden');
      }
      showMoreComments.page += 1;
    })
  };

  showMoreComments.page = 2;

  $videoPage
    .on('click', '.description-toggle', descriptionToggleHandler)
    .on('click', '.commentReplies', commentReplies)
    .on('click', '.reply', commentReply)
    .on('click', '#comment', checkIdentitiy)
    .on('click', '#btn-view-more-comments', showMoreComments)
    .on('click', '.countdown-paused', startCountdown)
    .on('click', '.pause-countdown', pauseCountdown)
    .on('click', '.comment-options', showOptions)
    .on('click', '.delete-comment', deleteComment)
    .on('click', '.report-comment', reportComment)
    .on('click', '.edit-comment', editComment)
    .on('click', '#edit-save-comment', saveEditComment)
    .on('click', '#follow', followUserHandler)
    .on('click', '.share', shareHandler)
    .on('click', '.report', reportVideoHandler)
    .on('click', '.like', likeHandler)
    .on('click', '#commentSave', commentSaveHandler)
    .on('click', '.nextVideos li a', nextVideoHandler)
    .on('click', '.slick-slide a', onVideoOwnerVideoHandler)
    .on('click', '.mobile-video-tabs li', tabHandler);
}

function onVideoOwnerVideoHandler(evt) {
    evt.preventDefault();
    var videoId = $(this).attr('id');

    startViewCount = true;
    initialPlayStart = false;

    $(this).switchVideo({selectedVideoId: videoId});
}

// checks user autoplay setting
function setAutoPlay() {
    if(userIdentity.isAuthenticated()) {
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
}

// set the comment options
function setCommentOptions(userId) {
    if(userIdentity.isAuthenticated()) {
        checkCommentForDelete(user._id);
    } else {
        checkCommentForDelete();
    }
}

function updateVideoSrc() {
    var videoType = 'video/mp4';
    VideoPlayer.updateSrc([
        {
            src: videoPathSrc.replace('.mp4', '-100.mp4'),
            type: videoType,
            label: 'low',
            res: '100'
        },
        {
            src: videoPathSrc.replace('.mp4', '-200.mp4'),
            type: videoType,
            label: 'med',
            res: '200'
        },
        {
            src: videoPathSrc,
            type: videoType,
            label: 'original',
            res: '300'
        }, {
            src: videoPathSrc.replace('.mp4', '-400.mp4'),
            type: videoType,
            label: 'high',
            res: '400'
        }
    ]);
}

//page init function
function initialize(videoPath, currentVideo) {
  video = currentVideo;
  videoPathSrc = videoPath;
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

  VideoPlayer = videojs('video-player', {
    plugins: {
      videoJsResolutionSwitcher: {
        default: defaultRes
      }
    }
  }, function () {
      updateVideoSrc();
  });
  //set video page
  $videoPage = $('.video-page');
  $videoPlayer = $('#video-player');

  $('.video-slick').slick(SLICK_CONFIG);

  setAutoPlay();

  videoInfoCheck();

  setCommentOptions();

  bindEvents();

  if (!browser.isMobile()) {
    $('[data-toggle="tooltip"]').tooltip();
  }

  //slide up function for description
  if ($( window ).width() >= 768) {
      setTimeout(function() {
          $('.show-more-description span').removeClass('invisible');
          $('#video-description').slideUp();
      }, 5000);
  }

  // render the social icons
  videoSocialShareTpl({video: video}, function (err, html) {
    $videoPage.find('.social-icons-container').html(html);
    videoSocialShare.setIconFontSize('sm');
    videoSocialShare.addClass('vertical-align');
    videoSocialShare.removeColorOnHover(true);
    videoSocialShare.initialize(video);
  });

  ga('send', 'event', 'video page', 'video-page-referrer', document.referrer);

  AVEventTracker({
    codeSource: 'videoPlayer',
    eventName: 'video-page-referrer',
    eventType: 'browser',
    referrer: document.referrer,
    videoId: video._id
  });
}

function viewTracking() {
  ga('send', 'event', 'video page', 'video-viewing', 'viewing video');
  AVEventTracker({
    codeSource: 'videoPlayer',
    eventName: 'video-viewing',
    eventType: 'browser',
    videoId: video._id
  });
}

// Capture the play duration upon exiting if video is still playing
$(window).bind('unload', function () {
  if (isPlaying) {
    var tDuration = $videoPlayer[0].player.duration(),
        vDuration = $videoPlayer[0].player.currentTime(),
        pCompletion = (vDuration/tDuration) * 100,
        pCompletionNearestTen = (Math.round(pCompletion / 10) * 10);

    ga('send', 'event', 'video page', 'video-exited-on-playing', 'viewing video', pCompletionNearestTen);
    AVEventTracker({
      codeSource: 'videoPlayer',
      eventName: 'video-exited-on-playing',
      eventType: 'browser',
      videoId: video._id,
      eventVideoPlaybackDetails: {
        totalDuration: tDuration,
        viewDuration: vDuration,
        percentCompletion: pCompletionNearestTen
      }
    });
  }
  // prevent a dialog to popup
  return undefined;
});

module.exports = {
  initialize: initialize
};