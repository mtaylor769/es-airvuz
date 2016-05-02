require('../styles/home.css');

function initialize() {
  var SLIDER_DESCRIPTION_DELAY = 5000,
    $homePage = $('#home-page'),
    $sliderDescriptionSlick = $('#slider-description-slick'),
    $sliderSlick = $('#slider-slick');

  $('.video-slick').slick({
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 4,
    draggable: false,
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
  });

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

    $sliderDescriptionSlick.delay(SLIDER_DESCRIPTION_DELAY).slideUp();

    $homePage.on('click', '#slider-description-row a', function (event) {
      event.preventDefault();
      $sliderDescriptionSlick.slideDown();
    });
  }

}

module.exports = {
  initialize: initialize
};