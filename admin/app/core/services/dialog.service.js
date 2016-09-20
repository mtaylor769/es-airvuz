(function() {
  'use strict';
  
  angular
    .module('AirvuzAdmin')
    .factory('dialog', dialog);
  
  dialog.$inject = ['$mdDialog'];
  
  function dialog($mdDialog) {
    return {
      confirm: function(options) {
        var confirm = $mdDialog.confirm()
            .title(options.title)
            .content(options.content)
            .ariaLabel(options.ariaLabel)
            .ok(options.ok)
            .cancel(options.cancel);
        return $mdDialog.show(confirm);
      },
      alert: function(options) {
        var alert = $mdDialog.alert()
            .title(options.title)
            .textContent(options.content)
            .ok(options.ok);
        return $mdDialog.show(alert)
      },
      custom: function(options) {
        var customConfig = {
          templateUrl: options.templateUrl,
          controller: options.controller,
          controllerAs: 'vm',
          clickOutsideToClose: true,
          locals: options.locals
        };
        return $mdDialog.show(customConfig);
      },
      serverError: function() {
        var error = $mdDialog.alert()
            .title('Error')
            .textContent('An error occurred. If this problem persists please contact support.')
            .ok('OK');
        return $mdDialog.show(error);
      }

    }

  }
})();
