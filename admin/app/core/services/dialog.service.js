(function() {
  'use strict';
  
  angular
    .module('AirvuzAdmin')
    .factory('dialog', dialog);
  
  dialog.$inject = ['$mdDialog'];
  
  function dialog($mdDialog) {
    return function(options) {
      var confirm = $mdDialog.confirm()
        .title(options.title)
        .content(options.content)
        .ariaLabel(options.ariaLabel)
        .ok(options.ok)
        .cancel(options.cancel);
      return $mdDialog.show(confirm);
    }
  }
})();
