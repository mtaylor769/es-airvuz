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
        $mdDialog.show(alert)
      }
    }

  }
})();
