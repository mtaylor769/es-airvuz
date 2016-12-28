var videojs = require('video.js');
require('videojs-resolution-switcher');

function initialize() {
    $('#category-page').on('click', 'img.video-link, h4.video-link', function(evt) {
        evt.preventDefault();

        var videoId = $(this).parent().data('id'),
            $category = $('#category-page'),
            isCustomCategoryVideo = $(this).parent().data('ccid').length > 0,
            ccid = $(this).parent().data('ccid'),
            ccidQueryParam = (isCustomCategoryVideo ? '?ccid=' + ccid: '');

        //intialize video.js
        window.VideoPlayer = videojs('video-player', {
            plugins: {
                videoJsResolutionSwitcher: {
                    default: ''
                }
            }
        });
        //set load and pause on video src
        window.VideoPlayer.load();
        window.VideoPlayer.pause();

        $.ajax({
            type: 'GET',
            url: '/spaRender/' + videoId + ccidQueryParam
        })
            .done(function(response) {
                //deatch hidden video player
                window.playerHolder = $('.video-container').detach();
                //hide homepage
                $category.hide();
                //scroll to top
                window.scrollTo(0,0);
                //append videopage view
                $('#view').append(response);
                //update url for video
                history.pushState({}, null, '/video/' + videoId + ccidQueryParam);
            })
            .fail(function(error) {
            })
    });
}

module.exports = {
    initialize: initialize
};