(function () {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .factory('AclGroupsService', AclGroupsService);

    AclGroupsService.$inject = ['$resource'];

    function AclGroupsService($resource) {
        function getAclGroup () {
            return $resource('/api/aclgroups/:id', {}, {
                update: {
                    method: 'PUT',
                },
                get: {
                    url: '/api/aclgroups/:name',
                    params: {name: '@name'},
                    isArray: false
                },
                removePermissions: {
                    url: '/api/aclgroups/:id/permissions',
                    method: 'PUT',
                    params: {id: '@id'},
                    isArray: false
                },
                addPermissions: {
                    url: '/api/aclgroups/:id/permissions',
                    method: 'POST',
                    params: {id: '@id'},
                    isArray: false
                }
            });
        }
        return {
            getAclGroup : getAclGroup
        }
    }
})();