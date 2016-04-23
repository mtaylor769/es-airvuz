require('../styles/index.css');
require('./config/jquery');



var AVEventTracker			= require('./avEventTracker');
var auth                = require('./auth');
var regexUrl            = null;
var test                = require('./test');
var token               = null;
var urlParseResults     = null;
var zeke                = require('./zeke');

window.Upload = require('./upload');

exports.add = function (a, b) { return a+b };

var identity      = require('./services/identity');
var user = identity;
//
// *************** start JQuery ***********************
$(document).ready(function() {
//


//
// *************** start video player page JS ***********************
//

  //insert comment reply

  $('.reply').on('click', function () {

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
      .done(function(data) {
        console.log(data);
        //insert comment on DOM
        var html = '<div class="flex placehold">'+
          '<img src="./tn_00001.jpg" height="50" width="50" class="border-radius-circle m-10-20">'+
          '<div class="m-t-20">'+
          '<p class="pos-absolute-r-15" datetime="' + data.commentCreatedDate + '"></p>'+
          '<p class="m-b-0 airvuz-blue">' + data.userId.userName + '</p>'+
          '<p class="m-b-0">' + data.comment + '</p>'+
          '</div>'+
          '</div>';

        $(self).parents('.comment-wrap').find('.parentComment').append(html);
      })
    });
  });

  //create comment and append

  $('#commentSave').on('click', function() {
		AVEventTracker({
			codeSource	: "videoPlayer",
			eventName		: "commentSave",
			eventType		: "click"
		});				
		
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
        '<img src="' + user.profilePicture + '" height="50" width="50" class="border-radius-circle m-10-20">'+
        '<div class="m-t-20">'+
        '<p class="pos-absolute-r-15" datetime="' + comment.commentCreatedDate + '"></p>'+
        '<p class="m-b-0 airvuz-blue">' + user.userName + '</p>'+
        '<p class="m-b-0 ">' + comment.comment + '</p>'+
        '</div>'+
        '</div>'+
        '<div  id="' + comment._id + '">'+
        '<ul class="parentComment"></ul>'+
        '<span class="reply" value="' + comment._id + '" style="margin: 0 0 0 30px">-> reply</span>'+
        '<span style="margin: 0 20px">replies: <a class="commentReplies" value="' + comment._id + '">' + comment.replyCount + '</a></span>'+
        '</div>'+
        '</li>';

      $('.parent-comments').prepend(html);
      $('#comment-text').val('')
    })
  });

//get child comments

  $('.commentReplies').on('click', function() {
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
          '<img src="' + user.profilePicture + '" height="30" width="30" class="border-radius-circle m-10-20">'+
          '<div class="m-t-20">'+
          '<p class="pos-absolute-r-15" datetime="' + reply.commentCreatedDate + '"></p>'+
          '<p class="m-b-0 airvuz-blue">' + user.userName + '</p>'+
          '<p class="m-b-0">' + reply.comment + '</p>'+
          '</div>'+
          '</div>' +
          '</li>'
      });

      //append child elements to DOM
      $(self).parents('div').find('.placehold').remove();
      $(self).parents('.comment-wrap').find('.parentComment').append(html);
      if(data.length === 10) {
        html = '<span><a class="moreReplies" value="'+parentId+'">load More</a></span>';
        $(self).parent().replaceWith(html);
      } else {
        $(self).parent().hide();
      }
    })
  });
  //screen toggling
  var screenWidth;
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

  $('#dialog').dialog({
    autoOpen:false,
    modal:true
  });

  $('.embed').on('click', function() {
    $('#dialog').dialog('open');
    $('.ui-widget-overlay').css('background', 'black');
    $('.social-icons').toggle();
  });

//
// ***************  end video player JS ***********************
//
  $('input[type="checkbox"]').onoff();

//
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
// ***************  end auth JS ***********************
//


  $('.onoffswitch input[type=checkbox]').on('click', function() {
    console.log($(this).val('off'));
  });

//
});
// ***************  end JQuery ***********************
//

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
