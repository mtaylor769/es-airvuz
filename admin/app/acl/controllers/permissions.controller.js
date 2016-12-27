(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('PermissionsController', PermissionsController);

    PermissionsController.$inject = ['$http'];

    function PermissionsController($http) {

        function initialize() {
            return $http.get('/api/aclpermissions/').then(function(response) {
                vm.permissions = response.data;
            });
        }

        // function addPermission(role) {
        //     var data = {};
        //     data.role = role;
        //     $http.put('/api/aclpermissions/' + vm.user._id, data).then(function(response) {
        //         vm.user.aclPermissions = response.data;
        //
        //     })
        // }
        //
        // function removePermission(role) {
        //     var data = {};
        //     data.role = role;
        //     $http.post('/api/aclPermissions/' + vm.user._id, data).then(function(response) {
        //         vm.user.aclPermissions = response.data;
        //         vm.availableRoles.push(role);
        //     })
        // }

        /////////////////////////////
        var vm = this;
        // vm.addPermission = addPermission;
        // vm.removePermission = removePermission;

        initialize();
    }
})();