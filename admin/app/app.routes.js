(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .config(routesConfig);

  routesConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routesConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/admin/',
        views: {
          '': {
            templateUrl: '/admin/app/home/partial/home.html',
            controllerAs: 'vm',
            controller: 'HomeController'
          }
        }
      })
      .state('login', {
        url: '/admin/login',
        templateUrl: '/admin/app/login/partial/login.html',
        controller: 'LoginController',
        controllerAs: 'vm'
      })
      .state('users', {
        url: '/admin/users',
        abstract: true,
        template: '<div ui-view></div>'
      })
      .state('users.aclRoles', {
        url:'/aclRoles',
        templateUrl: '/admin/app/users/partial/user-roles.html',
        params: {
          userId: null
        },
        controller: 'userRolesController',
        controllerAs: 'vm'
      })
      .state('users.all', {
        url: '',
        templateUrl: '/admin/app/users/partial/users.html',
        controller: 'UsersController',
        controllerAs: 'vm'
      })
      .state('users.user', {
        url: '/:id',
        templateUrl: '/admin/app/users/partial/user.html',
        controller: 'UserController',
        controllerAs: 'vm'
      })
      .state('videos', {
        url: '/admin/videos',
        abstract: true,
        template: '<div ui-view></div>'
      })
      .state('videos.all', {
        url: '',
        templateUrl: '/admin/app/videos/partial/videos.html',
        controller: 'VideosController',
        controllerAs: 'vm'
      })
      .state('videos.user', {
        url: '/:id',
        templateUrl: '/admin/app/videos/partial/video.html',
        controller: 'VideoController',
        controllerAs: 'vm'
      })
      .state('featuredVideos', {
        url: '/admin/featuredVideos',
        templateUrl: '/admin/app/featuredVideos/partial/featuredVideos.html',
        controller: 'featuredVideoController',
        controllerAs: 'vm'
      })
      .state('staffVideos', {
        url: '/admin/staffVideos',
        templateUrl: '/admin/app/staffPickVideos/partial/staffVideos.html',
        controller: 'StaffPickVideoController',
        controllerAs: 'vm'
      })
      .state('reports', {
        url: '/admin/reports',
        abstract: true,
        template: '<div ui-view></div>'
      })
      .state('reports.siteInfo', {
        url: '/site-info',
        templateUrl: '/admin/app/reports/template/site-info.html',
        controller: 'siteInfoController',
        controllerAs: 'vm'
      })
      .state('reports.videosUploaded', {
        url: '/video-upload',
        templateUrl: '/admin/app/reports/template/videos-uploaded.html',
        controller: 'videoUploadedController',
        controllerAs: 'vm'
      })
      .state('reports.commentsMade', {
        url: '/comments-made',
        templateUrl: '/admin/app/reports/template/comments-made.html',
        controller: 'commentsMadeController',
        controllerAs: 'vm'
      })
      .state('reports.employeeReport', {
        url: '/employee-report',
        templateUrl: '/admin/app/reports/template/user-employee.html',
        controller: 'userEmployeeController',
        controllerAs: 'vm'
      })
      .state('reports.hashtagVideo', {
        url: '/hashtag-video',
        templateUrl: '/admin/app/reports/template/video-hashtag.html',
        controller: 'videoHashtagController',
        controllerAs: 'vm'
      })
      .state('reports.hashtagUser', {
        url: '/hashtag-user',
        templateUrl: '/admin/app/reports/template/user-hashtag.html',
        controller: 'userHashtagController',
        controllerAs: 'vm'
      })
      .state('reports.top100AllTime', {
        url: '/top-100-alltime',
        templateUrl: '/admin/app/reports/template/top-views.html',
        controller: 'topViewsController',
        controllerAs: 'vm'
      })
      .state('reports.videoPercentage', {
        url: '/video-percentage',
        templateUrl: '/admin/app/reports/template/video-percentage.html',
        controller: 'videoPercentageController',
        controllerAs: 'vm'
      })
      .state('editVideo', {
        url: '/admin/editVideo/:id',
        templateUrl: '/admin/app/videos/partial/editVideo.html',
        controller: 'editVideoController',
        controllerAs: 'vm'
      })
      .state('editComments', {
        url: '/admin/editComments',
        templateUrl: '/admin/app/comments/partial/edit-comments.html',
        params: {
          video: null
        },
        controller: 'commentEditController',
        controllerAs: 'vm'
      })
      .state('adminEditVideo', {
        url: '/admin/adminEdit/:id',
        templateUrl: '/admin/app/videos/partial/adminEdit.html',
        controller: 'adminEditCtrl'
      })
      .state('droneType', {
        url: '',
        templateUrl: '/admin/app/drone-type/partials/droneType.html',
        controller: 'droneTypeController',
        controllerAs: 'vm'
      })
      .state('droneTypeCreate', {
        url: '/admin/droneType/create',
        templateUrl: '/admin/app/drone-type/partials/droneCreate.html',
        controller: 'createDroneController',
        controllerAs: 'vm'
      })
      .state('droneTypeEdit', {
        url: '/admin/droneType/:id',
        templateUrl: '/admin/app/drone-type/partials/droneTypeEdit.html',
        controller: 'droneTypeEditController',
        controllerAs: 'vm'
      })
      .state('cameraType', {
        url: '',
        templateUrl: '/admin/app/camera-type/partials/cameraType.html',
        controller: 'cameraTypeController',
        controllerAs: 'vm'
      })
      .state('cameraTypeCreate', {
        url: '/admin/cameraType/create',
        templateUrl: '/admin/app/camera-type/partials/cameraCreate.html',
        controller: 'createCameraController',
        controllerAs: 'vm'
      })
      .state('cameraTypeEdit', {
        url: '/admin/cameraType/:id',
        templateUrl: '/admin/app/camera-type/partials/cameraTypeEdit.html',
        controller: 'cameraTypeEditController',
        controllerAs: 'vm'
      })
      .state('sliders', {
        url: '/admin/sliders',
        abstract: true,
        template: '<div ui-view></div>'
      })
      .state('sliders.newSlide', {
        url:'/new-slide',
        templateUrl: '/admin/app/sliders/partial/new-slide.html',
        controller: 'newSlideController',
        controllerAs: 'vm'
      })
      .state('sliders.newSlider', {
        url: '/new-slider',
        templateUrl: '/admin/app/sliders/partial/new-slider.html',
        controller: 'newSliderController',
        controllerAs: 'vm'
      })
      .state('sliders.sliders', {
        url: '/sliders',
        templateUrl: '/admin/app/sliders/partial/sliders.html',
        controller: 'slidersController',
        controllerAs: 'vm'
      })
      .state('sliders.sliderEdit', {
        url:'/slider-edit/:id',
        templateUrl: '/admin/app/sliders/partial/slider-edit.html',
        controller: 'sliderEditController',
        controllerAs: 'vm'
      })
      .state('sliders.slides', {
        url: '/slides',
        templateUrl: '/admin/app/sliders/partial/slides.html',
        controller: 'slidesController',
        controllerAs: 'vm'
      })
      .state('sliders.slideEdit', {
        url: '/slide-edit/:id',
        templateUrl: '/admin/app/sliders/partial/slide-edit.html',
        controller: 'slideEditController',
        controllerAs: 'vm'
      })
      .state('videoCuration', {
        url: '/admin/video-curation',
        abstract: true,
        template: '<div ui-view></div>'
      })
      .state('videoCuration.rateVideos', {
        url: '/rate-videos',
        templateUrl: '/admin/app/video-curation/partial/rating.html',
        controller: 'ratingController',
        controllerAs: 'vm'
      })
      .state('videoCuration.searchSeo', {
        url: '/search-seo-keywords',
        templateUrl: '/admin/app/video-curation/partial/seo-search.html',
        params: {
          keyword: null
        },
        controller: 'seoSearchController',
        controllerAs: 'vm'
      })
      .state('videoCuration.landing', {
        url: '',
        templateUrl: '/admin/app/video-curation/partial/curation-landing.html',
        controller: 'curationLandingController',
        controllerAs: 'vm'
      })
      .state('videoCuration.rating', {
        url: '/rating',
        templateUrl: '/admin/app/video-curation/partial/rating.html',
        params: {
          type: null,
          videoId: null
        },
        controller: 'ratingController',
        controllerAs: 'vm'
      })
      .state('customCarousel', {
        url: '/admin/carousel',
        abstract: true,
        template: '<div ui-view></div>'
      })
      .state('customCarousel.all', {
        url: '/view-all',
        templateUrl: '/admin/app/custom-carousel/partials/view-all.html',
        controller: 'carouselViewAllController',
        controllerAs: 'vm'
      })
      .state('customCarousel.create', {
        url: '/create',
        templateUrl: '/admin/app/custom-carousel/partials/create.html',
        controller: 'carouselCreateController',
        controllerAs: 'vm'
      })
      .state('customCarousel.edit', {
        url: '/edit/:id',
        templateUrl: '/admin/app/custom-carousel/partials/edit.html',
        controller: 'carouselEditController',
        controllerAs: 'vm'
      });
    $urlRouterProvider.otherwise('/admin');
  }
})();
