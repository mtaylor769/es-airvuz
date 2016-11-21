/* global fbq, ga */
require('slick-carousel');
require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');
require('../styles/home.css');

var identity      = require('./services/identity'),
    AmazonConfig  = require('./config/amazon.config.client');

var $homePage;

var SLICK_CONFIG = {
  infinite: true,
  slidesToShow: 4,
  slidesToScroll: 4,
  draggable: false,
  nextArrow: '<button type="button" class="slick-next"><span class="glyphicon glyphicon-menu-right"></span></button>',
  prevArrow: '<button type="button" class="slick-prev"><span class="glyphicon glyphicon-menu-left"></span></button>',
  responsive: [
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3
      }
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        draggable: true,
        arrows: false
      }
    },
    {
      breakpoint: 450,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        draggable: true,
        arrows: false
      }
    }
  ]
};

function getFollowerVideos() {
  $.ajax('/api/videos/category/following-drone-videos')
    .then(function (videos) {
      if (videos.length > 0) {
        var viewData = {
          title: 'Following Drone Videos',
          viewAll: 'following-drone-videos',
          index: {
            following: videos
          },
          videos: 'following',
          s3Bucket: AmazonConfig.OUTPUT_BUCKET,
          cdnUrl: AmazonConfig.CDN_URL
        };
        require(['../templates/home/home-video.dust'], function (homeVideoTpl) {
          homeVideoTpl(viewData, function (err, html) {
            $homePage.find('#main-row > .border-left').append('<hr/>').append(html);
            $homePage.find('.video-slick').last().slick(SLICK_CONFIG).on('lazyLoadError', _lazyLoadError);
          });
        });
      }
    });
}

function _lazyLoadError(event, slick, image) {
  $(image).attr('src', AmazonConfig.CDN_URL + '/client/images/unavailable-drone-video-thumbnail-226x127.jpg');
}

function initialize(emailConfirm) {
  $homePage = $('#home-page');

  // load require css
  // require(['../../node_modules/slick-carousel/slick/slick.css', '../../node_modules/slick-carousel/slick/slick-theme.css']);
  var SLIDER_DESCRIPTION_DELAY = 5000,
    $sliderDescriptionSlick = $('#slider-description-slick'),
    $sliderSlick = $('#slider-slick');

  require(['slick-carousel'], function () {
    // Featured Videos, Recent Videos, Trending Videos, Staff Pick Videos
    $('.video-slick').slick(SLICK_CONFIG).on('lazyLoadError', _lazyLoadError);

    // has sliders
    if ($sliderSlick.length > 0) {
      $sliderSlick.slick({
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: true,
        fade: true,
        cssEase: 'linear',
        asNavFor: '#slider-description-slick'
      }).find('.slide').removeClass('hidden');

      $sliderDescriptionSlick.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: true,
        cssEase: 'linear',
        asNavFor: '#slider-slick'
      });

      $sliderDescriptionSlick.find('.slide-description')
        .delay(SLIDER_DESCRIPTION_DELAY)
        .slideUp({
          complete: function () {
            $('#slider-description-row')
              .find('.arrow span')
              .removeClass('rotate-180').parents('.arrow').removeClass('invisible');
          }
        });

      $homePage.on('click', '#slider-description-row .arrow a', function (event) {
        event.preventDefault();
        $sliderDescriptionSlick.find('.slide-description').slideToggle();
        $(this)
          .find('span')
          .toggleClass('rotate-180');
      });
    }

    if (identity.isAuthenticated()) {
      getFollowerVideos();
    }
  });

  bindEvents();
  emailConfirmCheck(emailConfirm);

  ga('send', 'event', 'home page', 'landing', 'landing page');
}

function emailConfirmCheck(emailConfirm) {
  if(emailConfirm === true) {
    $('#email-confirmed-modal').modal('show')
  } else if(emailConfirm === false) {
    $('#email-already-confirmed-modal').modal('show')
  }
}

function bindEvents() {
  $('.category-nav').on('click', 'h5', function () {
    $(this).parent().toggleClass('is-open');
  });

}

$('.go-to-video').on('click', function() {
  var videoId = $(this).parent().attr('data-video-id');

  require(['video.js', 'videojs-resolution-switcher'], function (videojs) {
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
      url: '/spaRender/' + videoId
    })
      .done(function(response) {
        // destroy the current slicks
        $homePage.find('.video-slick').slick('unslick');
        //deatch hidden video player
        window.playerHolder = $('.video-container').detach();
        //hide homepage
        $('#home-page').hide();
        //scroll to top
        window.scrollTo(0,0);
        //append videopage view
        $('#views').append(response);
        //update url for video
        history.pushState({}, null, '/video/' + videoId);
      })
      .fail(function(error) {
      });
  });
});

module.exports = {
  initialize: initialize
};