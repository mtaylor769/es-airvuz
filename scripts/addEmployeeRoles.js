var Promise = require('bluebird');
var userCrud = require('../app/persistence/crud/users');

function addRoles(employeeArray, contribArray) {
    return Promise.map(employeeArray, function(employeeId) {
        return userCrud.getUserById(employeeId)
            .then(function(employee) {
                if(employee.aclRoles.indexOf('user-employee') === -1) {
                    return userCrud.addAclRole('user-employee');
                } else {
                    return;
                }
            })
    }).then(function() {
        return Promise.map(contribArray, function(contribId) {
            return userCrud.getUserById(contribId)
                .then(function(contributor) {
                    if(contributor.aclRoles.indexOf('user-contributor') === -1) {
                        return userCrud.addAclRole('user-contributor');
                    } else {
                        return;
                    }
                })
        })
    })

}