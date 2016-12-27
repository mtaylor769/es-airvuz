(function () {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .factory('AclUsersService', AclUsersService);

    AclUsersService.$inject = ['$resource'];

    function AclUsersService($resource) {
        function getAclUser () {
            return $resource('/api/aclusers/:id',{},{
                // lookup an aclUser by user username
                getUser:{
                    url:'/api/aclusers/search/:username',
                    method:'GET',
                    params: {username:'@username'},
                    isArray:false
                },
                removePermissions: {
                    url: '/api/aclusers/:id/permissions',
                    method: 'PUT',
                    params: {id: '@id'},
                    isArray: false
                },
                addPermissions: {
                    url: '/api/aclusers/:id/permissions',
                    method: 'POST',
                    params: {id: '@id'},
                    isArray: false
                },
                getUserName: {
                    url: '/api/users/:id',
                    method: 'GET',
                    params: {id: '@id'},
                    isArray: false
                }
            });
        }
        return {
            getAclUser : getAclUser
        };
    }
})();