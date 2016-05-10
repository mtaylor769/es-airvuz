var AVEventTracker			= require('./avEventTracker');
var identity            = require('./services/identity');
var user                = identity;
var $videoPage;
var screenWidth;


var toggles       = {

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

function incrementVideoCount() {
  var videoId = {};
  videoId.videoId = window.location.pathname.substring(13);

  $.ajax({
      type: 'POST',
      url: '/api/videos/loaded',
      data: videoId,
      dataType: 'json'
    })
    .done(function(response) {
      console.log(response);
    })
    .error(function(error) {
      console.log(error);
    });
}

function bindEvents() {
  // all stuff with .on()


  //create comment and append

  $('#commentSave').on('click', function() {
    console.log('step one');
    AVEventTracker({
      codeSource	: "videoPlayer",
      eventName		: "commentSave",
      eventType		: "click"
    });
    console.log('step 2');

    var self = this;
    var comment = {};
    comment.videoId = $(this).attr('value');
    comment.comment = $('#comment-text').val();
    comment.userId = user._id;
    console.log(comment);
    $.ajax({
        type: 'POST',
        url: '/api/comment',
        data: comment,
        dataType: 'json'
      })
      .done(function(data) {
        var comment = data;
        console.log(user);

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
        $('#comment-text').val('')
        var currentCount = $('.commentCount').text();
        var toNumber = Number(currentCount);
        $('.commentCount').text('  ' + (toNumber + 1) + '  ');
      })
  });

  $('.go-to-video').on('click', function() {
    window.location.href = $(this).attr('value');
  });

  $('.like').on('click', function() {
    var likeObject = {};
    likeObject.videoId = $(this).attr('data-videoId');
    likeObject.userId = user._id;

    $.ajax({
        type: 'POST',
        url: '/api/video-like',
        data: likeObject,
        dataType: 'json'
      })
      .done(function(response) {
        $('.like').addClass('airvuz-blue');
      })
      .fail(function(error) {
        alert(error.responseText);
      })

  });

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

  $('.share').on('click', function() {
    $('.social-icons').toggle();
  });

  $('.embed').on('click', function() {
    $('#dialog').dialog('open');
    $('.ui-widget-overlay').css('background', 'black');
    $('.social-icons').toggle();
  });

  $('.onoffswitch input[type=checkbox]').on('click', function() {
    console.log($(this).val('off'));
  });

  $('.report').on('click', function() {
    $('#report-modal').modal('show');
  });

  $('.page-back').on('click', function() {
    window.history.back();
  });

  $('#comment-text').on('click', function() {
    if(!user._id) {
      $('#comment-modal').modal('show');
      $('.go-to-login').on('click', function() {
        $('#login-modal').modal('show');
      })
    }
  });

  $('#send-report').on('click', function() {
    console.log('button pressed');
    var reportData = {};
    reportData.videoId = $(this).attr('data-videoid');
    reportData.message = $('.report-text').val();
    console.log(reportData);
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

  $('#follow').on('click', function() {
    if(user._id && user._id !== video.userId) {
      var followData = {};
      followData.userId = user._id;
      followData.followingUserId = video.userId;
      console.log(followData);
      $.ajax({
          type: 'POST',
          url: '/api/follow',
          data: followData
        })
        .success(function (response) {
          console.log('response : ' + response)
        })
        .error(function (error) {
          console.log('error: ' + error)
        })
    } else if(!user._id) {
      console.log('login');
    } else {
      console.log('cannot follow yourself')
    }
  });

  $('#google').on('click', function() {
    $('#google-plus-modal').modal('show');
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
      comment.userId = user._id;
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

function initialize() {
  $videoPage = $('.video-page');
  incrementVideoCount();
  $('#auto-play-input').onoff();
  bindEvents();
  setTimeout(function() {
    $('#video-description').slideDown();
  }, 1000);
  setTimeout(function() {
    var html = '<div class="show-more-description"><span class="glyphicon glyphicon-chevron-down"></span></div>';
    $('#video-description').slideUp();
    $('.description-container').append(html)
  }, 5000);
}

module.exports = {
  initialize: initialize
};