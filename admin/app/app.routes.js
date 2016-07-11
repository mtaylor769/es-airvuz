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
        templateUrl: '/admin/app/reports/template/reports.html',
        controller: 'reportsController'
      })
      .state('editVideo', {
        url: '/admin/editVideo/:id',
        templateUrl: '/admin/app/videos/partial/editVideo.html',
        controller: 'editVideoController',
        controllerAs: 'vm'
      })
      .state('editComments', {
        url: '/admin/editComments/:id',
        templateUrl: '/admin/app/comments/templates/comments.html',
        controller: 'commentCtrl'
      })
      .state('adminEditVideo', {
        url: '/admin/adminEdit/:id',
        templateUrl: '/admin/app/videos/partial/adminEdit.html',
        controller: 'adminEditCtrl'
      })
      .state('sliders', {
        url: '/admin/sliders',
        templateUrl: '/admin/app/sliders/partial/sliders.html',
        controller: 'SlidersController',
        controllerAs: 'vm'
      });
    $urlRouterProvider.otherwise('/admin');
  }
})();
