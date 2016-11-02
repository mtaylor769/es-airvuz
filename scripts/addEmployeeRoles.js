var Promise = require('bluebird');
var userCrud1_0_0 = require('../app/persistence/crud/users1-0-0');

function addRoles(employeeArray, contribArray) {
    return Promise.map(employeeArray, function(employeeId) {
        return userCrud1_0_0.getUserById(employeeId)
            .then(function(employee) {
                if(employee.aclRoles.indexOf('user-employee') === -1) {
                    return userCrud1_0_0.addAclRole('user-employee');
                } else {
                    return;
                }
            })
    }).then(function() {
        return Promise.map(contribArray, function(contribId) {
            return userCrud1_0_0.getUserById(contribId)
                .then(function(contributor) {
                    if(contributor.aclRoles.indexOf('user-contributor') === -1) {
                        return userCrud1_0_0.addAclRole('user-contributor');
                    } else {
                        return;
                    }
                })
        })
    })

}