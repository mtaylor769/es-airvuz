(function () {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('AclUsersController', AclUsersController);

    AclUsersController.$inject = [
        '$scope',
        '$mdToast',
        '$mdDialog',
        'AclUsersService',
        'AclPermissionsService',
        'AclGroupMembersService',
        'AclGroupsService'
    ];

    function AclUsersController(
        $scope,
        $mdToast,
        $mdDialog,
        AclUsersService,
        AclPermissionsService,
        AclGroupMembersService,
        AclGroupsService) {
//<-------------------------------------------------------------------------------------------------------------------->
        function searchUsername() {

            var aclUserSvc = AclUsersService.getAclUser();

            var saveAclUser = function (linkedUserId) {
                return aclUserSvc.save({linkedUserId: linkedUserId})
                    .$promise
                    .then(function (data) {
                        // add the new aclUser Id to the model
                        vm.aclUser.id = data._id;
                    })
                    .catch(function (error) {
                        if (error.status == '401') {
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent("You do not have access to create a user policy")
                                    .position('bottom')
                                    .hideDelay(3000)
                            );
                        }
                    });
            }
            var getAclUser = function () {
                return aclUserSvc.getUser({username: vm.username})
                    .$promise
                    .then(function (data) {
                        vm.aclUser = data;
                        console.log(vm.aclUser);
                    })
                    .catch(function (error) {
                        // access denied from the API ACL Check
                        if (error.status == '401') {
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent("You do not have access to view a user policy")
                                    .position('bottom')
                                    .hideDelay(3000)
                            );
                        }
                    });
            }

            var showAclUser = function () {
                vm.showSearch = false;
                vm.showUser = true;
                $mdToast.hide();
                if(vm.aclUser.groups) {
                    vm.groups = vm.aclUser.groups;
                    vm.groups.forEach(function (group) {
                        group.isChecked = true;
                    })
                }
                if(vm.aclUser.permissions) {
                    vm.permissions = vm.aclUser.permissions;
                    vm.permissions.forEach(function (permission) {
                        permission.isChecked = true;
                    });
                }
            }
            // search for the user
            // if the user is not found, toast pop no user policy found
            // if the user is found, but its not an acl user, create one, then show details
            // if the user is found and is an acl user show details
            getAclUser()
                .then( function () {
                    if (vm.aclUser.INFO == 'No user found') {
                            vm.showSearch = true;
                            vm.showUser = false;
                            vm.username = '';
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('No user policy found')
                                    .position('bottom')
                                    .hideDelay(3000)
                            );
                        } else if (vm.aclUser.INFO == 'User is not an ACL User') {
                            saveAclUser(vm.aclUser.linkedUserId)
                                .then(showAclUser);
                        } else {
                            showAclUser();
                        }
                });
        }

//<-------------------------------------------------------------------------------------------------------------------->
        function changeUserStatus(status) {
            confirmDelete()
                .then(function () {
                    $http.put('/api/users/' + vm.aclUser.linkedUserId + '/status', {status: 'suspended'})
                        .then(function () {
                        }, function (error) {
                            if (error.status === 401) {
                                unAuthorized();
                            }
                        });
                });
        }

//<-------------------------------------------------------------------------------------------------------------------->
        function removeFromGroup() {
            var aclGroupMembers = AclGroupMembersService.getAclGroupMembers();

            vm.groups.forEach(function (group) {
                if (group.isChecked === false) {
                    aclGroupMembers.remove({id: group._id})
                        .$promise
                        .then(function () {
                            aclGroupMembers.getGroups({id: vm.aclUser.id})
                                .$promise
                                .then(function (response) {
                                    vm.groups = response;
                                    // set the isChecked value for each group to true so it has a checkmark in the UI
                                    vm.groups.forEach(function (group) {
                                        group.isChecked = true;
                                    });
                                });
                        })
                        .then(function () {
                            $mdDialog.hide();
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('User removed from group')
                                    .position('bottom')
                                    .hideDelay(3000)
                            );
                            vm.groupRemoveBtn = false;
                        })
                        .catch(function (error) {
                            if (error.status == '401') {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .textContent("You do not have access to remove a user from a group")
                                        .position('bottom')
                                        .hideDelay(3000)
                                );
                            }
                        });
                }
            });
        }

//<-------------------------------------------------------------------------------------------------------------------->
        function addToGroup(group) {
            var groupMemberData = {
                aclUser: vm.aclUser.id,
                aclGroup: group._id
            }
            // save the new group member record and get all the groups for the user
            var aclGroupMembers = AclGroupMembersService.getAclGroupMembers();
            aclGroupMembers.save(groupMemberData)
                .$promise
                .then(function () {
                    aclGroupMembers.getGroups({id: vm.aclUser.id})
                        .$promise
                        .then(function (response) {
                            vm.groups = response;
                            // set the isChecked value for each group to true so it has a checkmark in the UI
                            vm.groups.forEach(function (group) {
                                group.isChecked = true;
                            });
                        });
                })
                .then(function () {
                    $mdDialog.hide();
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('User added to Group: ' + group.name)
                            .position('bottom')
                            .hideDelay(3000)
                    );
                    vm.groupRemoveBtn = false;
                })
                .catch(function (error) {
                    if (error.status == '401') {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent("You do not have access to add a user to a group")
                                .position('bottom')
                                .hideDelay(3000)
                        );
                    }
                });
        }

//<-------------------------------------------------------------------------------------------------------------------->
        function addPermissions(permission) {

            // call the API, pass the removePermissions array containing the unchecked permissions
            var acluserSvc = AclUsersService.getAclUser();
            acluserSvc.addPermissions({id: vm.aclUser.id},{permission:permission})
                .$promise
                .then(function (response) {
                    // update the vm.permissions model with the returned permissions array
                    vm.permissions = response.permissions;
                    // set the isChecked value for each permission to true so it has a checkmark in the UI
                    vm.permissions.forEach(function (permission) {
                        permission.isChecked = true;
                    })
                })
                .then(function () {
                    $mdDialog.hide();
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Individual user permission added')
                            .position('bottom')
                            .hideDelay(3000)
                    );
                })
                .catch(function (error) {
                    if (error.status == '401') {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent("You do not have access to add a permission to a user policy")
                                .position('bottom')
                                .hideDelay(3000)
                        );
                    }
                });
        }

//<-------------------------------------------------------------------------------------------------------------------->
        function removePermissions() {
            // add the unchecked permissions to the permissionsRemove array
            var permissionsRemove = {permissions: []};
            vm.permissions.forEach(function (permission) {
                if (permission.isChecked === false) {
                    permissionsRemove.permissions.push(permission._id);
                }
            });
            // call the API, pass the removePermissions array containing the unchecked permissions
            var acluser = AclUsersService.getAclUser();
            acluser.removePermissions({id: vm.aclUser.id}, permissionsRemove)
                .$promise
                .then(function (response) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Individual user permission(s) removed')
                            .position('bottom')
                            .hideDelay(3000)
                    );
                    // update the vm.permissions model with the returned permissions array
                    vm.permissions = response.permissions;
                    // set the isChecked value for each permission to true so it has a checkmark in the UI
                    vm.permissions.forEach(function (permission) {
                        permission.isChecked = true;
                    });
                    // disable the button since nothing is unchecked
                    vm.permissionRemoveBtn = false;
                })
                .catch(function (error) {
                    if (error.status == '401') {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent("You do not have access to remove permissions from a user policy")
                                .position('bottom')
                                .hideDelay(3000)
                        );
                        // set the isChecked value for each permission to true so it has a checkmark in the UI
                        vm.permissions.forEach(function (permission) {
                            permission.isChecked = true;
                        });
                        // disable the button since nothing is unchecked
                        vm.permissionRemoveBtn = false;
                    }

                });
        }

//<-------------------------------------------------------------------------------------------------------------------->
        function showPermissions(ev) {
            var aclpermissions = AclPermissionsService.getAclPermissions();
            aclpermissions.query()
                .$promise
                .then(function (data) {
                    $mdDialog.show({
                        scope: $scope,
                        preserveScope: true,
                        locals: {
                            permissions: data
                        },
                        controller: ['$scope', 'permissions', function ($scope, permissions) {
                            $scope.permissions = permissions
                        }],
                        templateUrl: '/admin/app/acl/partials/permissions.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true
                    });
                })
                .catch(function (error) {
                    // access denied from the API ACL Check
                    if (error.status == '401') {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent("You do not have access to view ACL Permissions")
                                .position('bottom')
                                .hideDelay(3000)
                        );
                    }
                });
        };

//<-------------------------------------------------------------------------------------------------------------------->
        function showConfirm(title) {
            var confirm = $mdDialog.confirm()

                .title(title)
                .textContent('This will take effect immediately')
                .ariaLabel('Lucky day')
                .targetEvent(title)
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                if (title == 'Remove permission(s) from user?') {
                    vm.removePermissions();
                } else if (title == 'Remove user from group(s)?') {
                    vm.removeFromGroup();
                } else if (title == 'Remove user?') {
                    vm.removeUser();
                }

            }, function () {
                // user cancelled
            });
        };

//<-------------------------------------------------------------------------------------------------------------------->
        function showGroups(ev) {
            // get all the groups for a user
            var aclGroups = AclGroupsService.getAclGroup();
            aclGroups.query()
                .$promise
                .then(function (data) {
                    $mdDialog.show({
                        scope: $scope,
                        preserveScope: true,
                        locals: {
                            groups: data
                        },
                        controller: ['$scope', 'groups', function ($scope, groups) {
                            $scope.groups = groups
                        }],
                        templateUrl: '/admin/app/acl/partials/groups.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true
                    });
                })
                .catch(function (error) {
                    // access denied from the API ACL Check
                    if (error.status == '401') {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent("You do not have access to view ACL Groups")
                                .position('bottom')
                                .hideDelay(3000)
                        );
                    }
                });
        }

//<-------------------------------------------------------------------------------------------------------------------->
        function removeUser() {
            var aclUser = AclUsersService.getAclUser();
            var aclGroupMembers = AclGroupMembersService.getAclGroupMembers();

            var removeAclUser = function () {
                    return aclUser.remove({id: vm.aclUser.id})
                        .$promise
                        .then(function (data) {
                            // console.log(data);
                        })
                        .catch(function (error) {
                            if (error.status == '401') {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .textContent("You do not have permission to remove a user")
                                        .position('bottom')
                                        .hideDelay(3000)
                                );
                            }
                        });
                },
                removeFromGroups = function () {
                    if (vm.groups) {
                        vm.groups.forEach(function (group) {
                            aclGroupMembers.removeByAclUserId({id: vm.aclUser.id})
                                .$promise
                                .then(function (data) {
                                    // clear the groups and permissions arrays so the data is refreshed upon new user search
                                    vm.groups.length = 0;
                                    vm.permissions.length = 0;
                                })
                                .catch(function (error) {
                                    $mdToast.show(
                                        $mdToast.simple()
                                            .textContent('Unable to remove user from all groups')
                                            .position('bottom')
                                            .hideDelay(3000)
                                    );
                                });
                        });
                    }
                },
                showConfirmation = function () {
                    vm.showSearch = true;
                    vm.showUser = false;
                    vm.username = '';
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('User removed')
                            .position('bottom')
                            .hideDelay(3000)
                    );
                };

            removeAclUser()
                .then(removeFromGroups)
                .then(showConfirmation);
        }

        /////////////////////////////
        var vm = this;
        vm.showSearch = true;
        vm.showUser = false;
        vm.permissionRemoveBtn = false;
        vm.groupRemoveBtn = false;
        vm.searchUsername = searchUsername;
        vm.changeUserStatus = changeUserStatus;
        vm.removeFromGroup = removeFromGroup;
        vm.addToGroup = addToGroup;
        vm.addPermissions = addPermissions;
        vm.removePermissions = removePermissions;
        vm.showPermissions = showPermissions;
        vm.showConfirm = showConfirm;
        vm.showGroups = showGroups;
        vm.removeUser = removeUser;
    }
})();