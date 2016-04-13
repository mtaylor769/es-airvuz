require('../styles/index.css');

var test = require('./test');
var a = "a";
var zeke = require('./zeke');
var login = require('./login');

var a = "ab";

exports.add = function (a, b) { return a+b };

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
      '<textarea id="comment" cols="80" rows="3" class="m-r-20" style="margin-bottom: 20px;"></textarea>' +
      '<button class="btn background-orange border-radius-0 font-white" id="saveComment" style="margin-bottom: 20px;">Submit</button>' +
      '</div>';
    $(elementId).append(html);
    $('.commentBox').delay(200).slideDown();
    $(this).hide();


    //comment submit function
    $('#saveComment').click(function() {
      var comment = {};
      comment.comment = $('#comment').val();
      comment.parent = parentCommentId;
      comment.userId = '56fdff4edc7083d853532661';
      comment.videoId = '56fec7bb07354aaa096db3b8';
      console.log(comment);

      $.post('/api/comment', comment, function(data, status) {
        console.log(data);
      })

    });
  });




//
// ***************  end video player JS ***********************
//



//
});
// ***************  end JQuery ***********************
//
