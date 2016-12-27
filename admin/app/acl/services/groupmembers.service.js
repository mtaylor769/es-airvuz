(function () {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .factory('AclGroupMembersService', AclGroupMembersService);

    AclGroupMembersService.$inject = ['$resource'];

    function AclGroupMembersService($resource) {
        function getAclGroupMembers () {
            return $resource('/api/aclgroupmembers/:id', {id: '@id'}, {
                update: {
                    method: 'PUT'
                },
                //get the members of a group
                getGroupMembers: {
                    method: 'GET',
                    url: '/api/aclgroupmembers/aclgroups/:id',
                    params: {id: '@id'},
                    isArray: true
                },
                // get the groups of a member
                getGroups: {
                    method: 'GET',
                    url: '/api/aclgroupmembers/aclusers/:id',
                    params: {id: '@id'},
                    isArray: true
                },
                removeByAclUserId: {
                    method: 'DELETE',
                    url: '/api/aclgroupmembers/aclusers/:id',
                    params: {id: '@id'},
                    isArray: false
                }
            });
        }
        return {
            getAclGroupMembers : getAclGroupMembers
        }
    }
})();