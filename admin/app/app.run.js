(function () {
  'use strict';

  angular
    .module('AirvuzAdmin')
    .run(run);

  run.$inject = ['$rootScope', '$window', '$mdSidenav'];

  /* @ngInject */
  function run($rootScope, $window, $mdSidenav) {
    $rootScope.$on('$stateChangeSuccess', function () {
      $window.scrollTo(0, 0);

      // close side nav
      $mdSidenav('left').isOpen() && $mdSidenav('left').toggle();
    });
  }
})();
