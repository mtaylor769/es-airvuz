(function () {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .factory('AclPermissionsService', AclPermissionsService);

    AclPermissionsService.$inject = ['$resource'];

    function AclPermissionsService($resource) {
        function getAclPermissions () {
            return $resource('/api/aclpermissions/:id', {id: '@id'}, {
                update: {
                    method: 'PUT'
                }
            });
        }
        return {
            getAclPermissions : getAclPermissions
        }
    }
})();