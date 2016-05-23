require('../styles/home.css');

var identity      = require('./services/identity');

/**
 * Templates
 */
var homeVideoTpl = require('../templates/home/home-video.dust');

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
  $.ajax('/api/videos/category/Follower%20Videos/page/1')
      .then(function (videos) {
        if (videos.length > 0) {
          homeVideoTpl({title: 'Follower Videos', viewAll: 'Follower%20Videos', index: {follower: videos}, videos: 'follower'}, function (err, html) {
            $homePage.find('#main-row > .border-left').append('<hr/>').append(html);
            $homePage.find('.video-slick').last().slick(SLICK_CONFIG);
          });
        }
      });
}

function initialize() {
  $homePage = $('#home-page');

  var SLIDER_DESCRIPTION_DELAY = 5000,
    $sliderDescriptionSlick = $('#slider-description-slick'),
    $sliderSlick = $('#slider-slick');

  // Featured Videos, Recent Videos, Trending Videos, Staff Pick Videos
  $('.video-slick').slick(SLICK_CONFIG);

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
            .removeClass('fa-rotate-180').parents('.arrow').removeClass('invisible');
        }
      });

    $homePage.on('click', '#slider-description-row .arrow a', function (event) {
      event.preventDefault();
      $sliderDescriptionSlick.find('.slide-description').slideToggle();
      $(this)
        .find('span')
        .toggleClass('fa-rotate-180');
    });
  }

  if (identity.isAuthenticated()) {
    getFollowerVideos();
  }

  bindEvents();
}

function bindEvents() {
  $('#left-category').on('click', 'h5', function () {
    $(this).parent().toggleClass('is-open');
  });
}

module.exports = {
  initialize: initialize
};