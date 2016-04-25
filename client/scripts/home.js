require('../styles/home.css');

function initialize() {
  $('.video-slick').slick({
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 3,
    draggable: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
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

  $('#slider-slick').slick({
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
    fade: true,
    cssEase: 'linear'
  }).removeClass('hidden');
}

module.exports = {
  initialize: initialize
};