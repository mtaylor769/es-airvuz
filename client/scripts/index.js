require('../styles/index.css');

var test = require('./test');
var a = "a";

exports.add = function (a, b) { return a+b };


//exports.videoPlayer = require('./video-player');
//
// *************** start JQuery ***********************
$(document).ready(function() {
//


//
// *************** start video player page JS ***********************
//
  $('.reply').on('click', function () {
    var elementId = '#'+$(this).attr('value');
    var html = '<div style="display: none" class="flex commentBox">' +
      '<textarea cols="80" rows="3" class="m-r-20" style="margin-bottom: 20px;"></textarea>' +
      '<button class="btn background-orange border-radius-0 font-white" style="margin-bottom: 20px;">Submit</button>' +
      '</div>';
    $(elementId).append(html);
    $('.commentBox').delay(200).slideDown();
    $(this).hide();
  });



//
// ***************  end video player JS ***********************
//



//
});
// ***************  end JQuery ***********************
//
