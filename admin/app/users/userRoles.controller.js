(function() {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('userRolesController', userRolesController);

    userRolesController.$inject = ['$http', '$state', 'identity'];

    function userRolesController($http, $state, identity) {

        function initialize() {
            return $http.get('/api/aclRoles/' + $state.params.userId).then(function(response) {
                vm.user = response.data;
                vm.user.aclRoles.forEach(function(role) {
                    var index = vm.availableRoles.indexOf(role);
                    if(index > -1) {
                        vm.availableRoles.splice(index, 1);
                    }
                });
                if(identity.hasRole('root')) {
                    vm.availableRoles.push('user-root')
                }
                if(identity.hasRole('root' || 'user-root')) {
                    vm.availableRoles.push('user-admin');
                }
            })
        }

        function addRole(role) {
            var data = {};
            data.role = role;
            $http.put('/api/aclRoles/' + vm.user._id, data).then(function(response) {
                vm.user.aclRoles = response.data;
                vm.user.aclRoles.forEach(function(role) {
                    var index = vm.availableRoles.indexOf(role);
                    if(index > -1) {
                        vm.availableRoles.splice(index, 1);
                    }
                })
            })
        }

        function removeRole(role) {
            var data = {};
            data.role = role;
            $http.post('/api/aclRoles/' + vm.user._id, data).then(function(response) {
                vm.user.aclRoles = response.data;
                vm.availableRoles.push(role);
            })
        }



    /////////////////////////////
        var vm = this;
        vm.addRole = addRole;
        vm.removeRole = removeRole;
        vm.availableRoles = [
            'user-general',
            'user-employee',
            'user-contributor'
        ];

        initialize();
    }
})();