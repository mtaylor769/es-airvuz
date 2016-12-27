(function () {
    'use strict';

    angular
        .module('AirvuzAdmin')
        .controller('AclGroupsController', AclGroupsController);

    AclGroupsController.$inject = [
        '$scope',
        '$state',
        '$mdToast',
        '$mdDialog',
        '$q',
        'AclUsersService',
        'AclPermissionsService',
        'AclGroupMembersService',
        'AclGroupsService'
    ];

    function AclGroupsController($scope,
                                 $state,
                                 $mdToast,
                                 $mdDialog,
                                 $q,
                                 AclUsersService,
                                 AclPermissionsService,
                                 AclGroupMembersService,
                                 AclGroupsService) {
//<-------------------------------------------------------------------------------------------------------------------->
        // Search for a group
        function searchGroupName() {

            var aclGroup = AclGroupsService.getAclGroup();
            var aclGroupMembers = AclGroupMembersService.getAclGroupMembers();
            var aclUsers = AclUsersService.getAclUser();

            aclGroup.get({name: vm.groupname})
                .$promise
                .then(function (data) {
                    vm.group = data;
                    if (vm.group.INFO == 'ACL Group not found') {
                        vm.showSearch = true;
                        vm.showGroup = false;
                        vm.groupname = '';
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('No group policy found')
                                .position('bottom')
                                .hideDelay(3000)
                        );
                    } else {
                        vm.showSearch = false;
                        vm.showGroup = true;
                        $mdToast.hide();
                        aclGroupMembers.getGroupMembers({id: vm.group._id})
                            .$promise
                            .then(function (data) {
                                vm.members = data;
                                if (vm.members[0].INFO == 'No ACL users in this group') {
                                    vm.noUsersMsg = vm.members[0].INFO;
                                    vm.userRemoveBtn = false;
                                } else {
                                    vm.members.forEach(function (member, i) {
                                        aclUsers.getUserName({id: member.aclUser.linkedUserId})
                                            .$promise
                                            .then(function (data) {
                                                vm.members[i].userNameDisplay = data.userNameDisplay;
                                                vm.members[i].isChecked = true;
                                            });
                                    });
                                }
                            });
                        vm.groupPermissions = vm.group.permissions;
                        vm.groupPermissions.forEach(function (permission) {
                            permission.isChecked = true;
                        });
                    }
                })
                .catch(function (error) {
                    // access denied from the API ACL Check
                    if (error.status == '401') {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent("You do not have access to view a group policy")
                                .position('bottom')
                                .hideDelay(3000)
                        );
                    }
                });
        }

//<-------------------------------------------------------------------------------------------------------------------->
        // Add a new group
        function addGroup(groupname) {
            var aclGroup = AclGroupsService.getAclGroup();
            aclGroup.save({name: groupname})
                .$promise
                .then(function (data) {
                    vm.group = data;
                    vm.showAdd = false;
                    vm.showGroup = true;
                    $mdToast.hide();
                })
                .catch(function (error) {
                    if (error.status == '401') {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent("You do not have permission to add a group policy")
                                .position('bottom')
                                .hideDelay(3000)
                        )
                    }
                })
        }

//<-------------------------------------------------------------------------------------------------------------------->
        // Add a new or existing acl user to a group
        function addToGroup(params) {
            // save the new group member record and get all the members for the group
            var aclGroupMembers = AclGroupMembersService.getAclGroupMembers();
            var aclUsers = AclUsersService.getAclUser();

            var saveAclUser = function (linkedUserId) {
                return aclUsers.save({linkedUserId: linkedUserId})
                    .$promise
                    .then(function (data) {
                        return data;
                    })
                    .catch(function (error) {
                        //
                    });
            }

            var saveGroupMember = function (groupMember) {
                return aclGroupMembers.save(groupMember)
                    .$promise
                    .then(function () {
                        return aclGroupMembers.getGroupMembers({id: vm.group._id})
                            .$promise
                            .then(function (data) {
                                vm.members = data;
                                // set the isChecked value for each group to true so it has a checkmark in the UI
                                vm.members.forEach(function (member) {
                                    return aclUsers.getUserName({id: member.aclUser.linkedUserId})
                                        .$promise
                                        .then(function (data) {
                                            member.userNameDisplay = data.userNameDisplay;
                                            member.isChecked = true;
                                            return data;
                                        })
                                        .catch(function (error) {
                                            console.error(error);
                                        })
                                });
                                // clear the permissions so the next time a user is displayed the permissions will be correct
                                // if there are no permissions for the user
                                if (vm.permissions.length != 0) {
                                    vm.permissions.length = 0;
                                }
                                return vm.username = '';
                            });
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
            var showConfirmation = function () {
                $mdDialog.hide();
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('User added to Group: ' + vm.group.name)
                        .position('bottom')
                        .hideDelay(3000)
                );
                vm.userRemoveBtn = false;
                vm.username = '';
            }

            // if theres no aclUserId make a new aclUser before adding to group
            if (params.aclUser === 0) {
                console.log("acluser id is zero: " + params.aclUser)
                saveAclUser(params.linkedUserId)
                    .then(function(newAclUser) {
                        saveGroupMember({aclUser: newAclUser._id, aclGroup: params.aclGroup});
                    })
                    .then(showConfirmation);
            } else {
                console.log("acluser id is not zero: " + params.aclUser)
                saveGroupMember({aclUser: params.aclUser, aclGroup: params.aclGroup})
                    .then(showConfirmation);
            }
        }

//<-------------------------------------------------------------------------------------------------------------------->
        // Remove a user from a group
        function removeFromGroup() {
            var aclGroupMembers = AclGroupMembersService.getAclGroupMembers();
            var aclUsers = AclUsersService.getAclUser();

            var removeMembers = function () {
                // wrap in a promise in case theres multiple members to delete
                var deferred = $q.defer();

                for (var i = 0; i < vm.members.length; i++) {
                    console.log(i);
                    if (vm.members[i].isChecked === false) {
                        aclGroupMembers.remove({id: vm.members[i]._id})
                            .$promise
                            .then(function (data) {
                                $mdDialog.hide();
                                $mdToast.show(
                                    $mdToast.simple()
                                        .textContent('User removed from group: ' + vm.group.name)
                                        .position('bottom')
                                        .hideDelay(3000)
                                );
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
                }
                deferred.resolve();
                return deferred.promise;
            }

            var getGroupMembers = function () {
                aclGroupMembers.getGroupMembers({id: vm.group._id})
                    .$promise
                    .then(function (data) {
                        vm.members = data;
                        // set the isChecked value for each group to true so it has a checkmark in the UI
                        if (vm.members[0].INFO == 'No ACL users in this group') {
                            vm.noUsersMsg = vm.members[0].INFO;
                            vm.userRemoveBtn = false;
                        } else {
                            vm.members.forEach(function (member, i) {
                                aclUsers.getUserName({id: member.aclUser.linkedUserId})
                                    .$promise
                                    .then(function (data) {
                                        vm.members[i].userNameDisplay = data.userNameDisplay;
                                        vm.members[i].isChecked = true;
                                    });
                            });
                        }
                        vm.userRemoveBtn = false;
                    })
                    .catch(function (error) {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent(error)
                                .position('bottom')
                                .hideDelay(3000)
                        );
                    });

            }

            removeMembers()
                .then(getGroupMembers);
        }

//<-------------------------------------------------------------------------------------------------------------------->
        // Show all the users in the group
        function showUsers(ev) {
            // show a dialog window with a search field
            vm.showSearchPop = true;
            vm.showUserPop = false;
            $mdDialog.show({
                scope: $scope,
                preserveScope: true,
                controller: ['$scope', function ($scope) {
                }],
                templateUrl: '/admin/app/acl/partials/addToGroup.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        }

//<-------------------------------------------------------------------------------------------------------------------->
        // Search for a user to add to the group
        function searchForUser(username) {
            // adding an ACL user or User to a group popup submit function
            var aclUser = AclUsersService.getAclUser();
            var aclGroupMembers = AclGroupMembersService.getAclGroupMembers();

            //call the resource method that looks up a user from the users collection
            aclUser.getUser({username: username})
                .$promise
                .then(function (data) {
                    vm.aclUser = data;
                    console.log(data);

                    if (vm.aclUser.INFO === 'No user found') {
                        vm.showSearchPop = true;
                        vm.showUserPop = false;
                        vm.username = '';
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('No user found')
                                .position('bottom')
                                .hideDelay(3000)
                        );


                    } else if (vm.aclUser.INFO === 'User is not an ACL User') {
                        vm.showSearchPop = false;
                        vm.showUserPop = true;
                        $mdToast.hide();

                        // get the users details
                        aclUser.getUserName({id: vm.aclUser.linkedUserId})
                            .$promise
                            .then(function (data) {
                                vm.aclUser = data;
                                // set the aclUserId to 0 so a new aclUser is created when this user is added to group
                                vm.aclUser.id = 0;
                                vm.groups = [];
                                vm.permissions = [];
                            });


                    } else {
                        vm.showSearchPop = false;
                        vm.showUserPop = true;
                        $mdToast.hide();
                        //get the aclUsers groups with their aclUserId
                        aclGroupMembers.getGroups({id: vm.aclUser.id})
                            .$promise
                            .then(function (data) {
                                vm.groups = data;
                                vm.groups.forEach(function (group) {
                                    group.isChecked = true;
                                })
                            })
                        vm.permissions = vm.aclUser.permissions;
                        vm.permissions.forEach(function (permission) {
                            permission.isChecked = true;
                        });
                    }

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

//<-------------------------------------------------------------------------------------------------------------------->
        // Add permissions to the group
        function addPermissions(permission) {
            // create an array of permissions to add because API can accept more than one permission at a time
            var permissionsAdd = {permissions: []};

            permissionsAdd.permissions.push(permission);

            // call the API, pass the removePermissions array containing the unchecked permissions
            var aclGroup = AclGroupsService.getAclGroup();
            aclGroup.addPermissions({id: vm.group._id}, permissionsAdd)
                .$promise
                .then(function (response) {
                    // update the vm.permissions model with the returned permissions array
                    vm.groupPermissions = response.permissions;
                    // set the isChecked value for each permission to true so it has a checkmark in the UI
                    vm.groupPermissions.forEach(function (permission) {
                        permission.isChecked = true;
                    })
                })
                .then(function () {
                    $mdDialog.hide();
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Group policy permission added')
                            .position('bottom')
                            .hideDelay(3000)
                    );
                })
                .catch(function (error) {
                    if (error.status == '401') {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent("You do not have access to add a permission to a group policy")
                                .position('bottom')
                                .hideDelay(3000)
                        )
                    }
                });
        }

//<-------------------------------------------------------------------------------------------------------------------->
        // Remove permissions from the group
        function removePermissions() {
            // add the unchecked permissions to the permissionsRemove array
            var permissionsRemove = {permissions: []};
            vm.groupPermissions.forEach(function (permission) {
                if (permission.isChecked === false) {
                    permissionsRemove.permissions.push(permission._id);
                }
            });
            // call the API, pass the removePermissions array containing the unchecked permissions
            var aclGroup = AclGroupsService.getAclGroup();
            aclGroup.removePermissions({id: vm.group._id}, permissionsRemove)
                .$promise
                .then(function (response) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Group policy permission(s) removed')
                            .position('bottom')
                            .hideDelay(3000)
                    );
                    // update the vm.permissions model with the returned permissions array
                    vm.groupPermissions = response.permissions;
                    // set the isChecked value for each permission to true so it has a checkmark in the UI
                    vm.groupPermissions.forEach(function (permission) {
                        permission.isChecked = true;
                    });
                    // disable the button since nothing is unchecked
                    vm.permissionRemoveBtn = false;
                })
                .catch(function (error) {
                    if (error.status == '401') {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent("You do not have access to remove permissions from a group policy")
                                .position('bottom')
                                .hideDelay(3000)
                        );
                        // set the isChecked value for each permission to true so it has a checkmark in the UI
                        vm.groupPermissions.forEach(function (permission) {
                            permission.isChecked = true;
                        });
                        // disable the button since nothing is unchecked
                        vm.permissionRemoveBtn = false;
                    }

                });
        }

//<-------------------------------------------------------------------------------------------------------------------->
        // Show all the permissions assigned to the group
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
        // Show the confirm dialog popup
        function showConfirm(ev) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()

                .title(ev)
                .textContent('This will take effect immediately')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                if (ev == 'Remove permission(s) from group?') {
                    vm.removePermissions();
                } else if (ev == 'Remove user(s) from group?') {
                    vm.removeFromGroup();
                } else if (ev == 'Remove group?') {
                    vm.removeGroup();
                }

            }, function () {
                // user cancelled
            });
        }

//<-------------------------------------------------------------------------------------------------------------------->
        // Delete the group
        function removeGroup() {
            var aclGroupSvc = AclGroupsService.getAclGroup();
            var aclGroupMembersSvc = AclGroupMembersService.getAclGroupMembers();

            var removeAclGroup = function () {
                    return aclGroupSvc.remove({id: vm.group._id})
                        .$promise
                        .then(function (data) {

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
                removeMembers = function () {
                    if (vm.members) {
                        console.log(vm.members);
                        vm.members.forEach(function (member) {
                            aclGroupMembersSvc.remove({id: member._id})
                                .$promise
                                .then(function (data) {

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
                    vm.showGroup = false;
                    vm.groupname = '';
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Group removed')
                            .position('bottom')
                            .hideDelay(3000)
                    );
                };

            removeAclGroup()
                .then(removeMembers)
                .then(showConfirmation);
        }


        /////////////////////////////
        var vm = this;

        // show / hide the search panel
        // show / hide the add panel
        if ($state.current.name == 'acl.groups.add') {
            vm.showSearch = false;
            vm.showAdd = true;
        } else {
            vm.showSearch = true;
            vm.showAdd = false;
        }
        // show / hide the result panel
        vm.showGroup = false;
        // enable / disable the update permissions button
        vm.permissionRemoveBtn = false;
        // enable / disable the update group members button
        vm.userRemoveBtn = false;
        vm.showConfirm = showConfirm;
        vm.showPermissions = showPermissions;
        vm.showUsers = showUsers;
        vm.searchForUser = searchForUser;
        vm.searchGroupName = searchGroupName;
        vm.addGroup = addGroup;
        vm.addToGroup = addToGroup;
        vm.removeFromGroup = removeFromGroup;
        vm.addPermissions = addPermissions;
        vm.removePermissions = removePermissions;
        vm.removeGroup = removeGroup;
    }
})();