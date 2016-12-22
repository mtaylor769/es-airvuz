var namespace = 'app.persistence.crud.users1-0-0';
try {
    var log4js          = require('log4js');
    var logger          = log4js.getLogger(namespace);
    var Promise         = require('bluebird');
    var ErrorMessage    = require('../../utils/errorMessage');
    var socialCrud      = require('../../persistence/crud/socialMediaAccount');
    var database        = require('../database/database');
    var UserModel       = database.getModelByDotPath({modelDotPath: "app.persistence.model.users"});
    var crypto          = require('crypto');

}
catch (exception) {
    logger.error(" import error:" + exception);
}

var users = function () {
};

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
users.prototype.validateCreateUser = function (params) {
    /*
     * @type {string}
     */
    logger.debug('made it to validation');
    var sourceLocation = "persistence.crud.Users.create";
    var userInfo = {};
    //need to pass in user data info
    var errorMessage = new ErrorMessage();
    userInfo.data = {};
    userInfo.data.coverPicture = params.coverPicture || "";
    userInfo.data.emailAddress = params.emailAddress || null;
    userInfo.data.userNameDisplay = params.userNameDisplay || null;
    userInfo.data.aclRoles = params.aclRoles || ['user-general'];
    userInfo.data.profilePicture = params.profilePicture || "";
    userInfo.data.isSubscribeAirVuzNews = params.isSubscribeAirVuzNews || false;

    if (params.social) {
        userInfo.data.status = 'active';
    } else {
        userInfo.data.password = params.password || null;
        userInfo.data.confirmPassword = params.confirmPassword || null;
        userInfo.data.status = 'email-confirm';

        if (userInfo.data.password === null) {
            userInfo.errors = errorMessage.getErrorMessage({
                statusCode: "400",
                errorId: "VALIDA1000",
                templateParams: {
                    name: "password"
                },
                sourceError: "#password",
                displayMsg: "This field is required",
                errorMessage: "Password is null",
                sourceLocation: sourceLocation
            });
        }
        if (userInfo.data.confirmPassword === null) {
            userInfo.errors = errorMessage.getErrorMessage({
                statusCode: "400",
                errorId: "VALIDA1000",
                templateParams: {
                    name: "emailAddress"
                },
                sourceError: "#confirm-password",
                displayMsg: "This field is required",
                errorMessage: "Confirm Password is null",
                sourceLocation: sourceLocation
            });
        }
        if (userInfo.data.password !== null && userInfo.data.confirmPassword !== null && userInfo.data.password !== userInfo.data.confirmPassword) {
            userInfo.errors = errorMessage.getErrorMessage({
                statusCode: "400",
                errorId: "VALIDA1000",
                templateParams: {
                    name: "emailAddress"
                },
                sourceError: "#password",
                displayMsg: "Passwords do not match",
                errorMessage: "Passwords dont match",
                sourceLocation: sourceLocation
            });
        }
    }
    if (userInfo.data.emailAddress === null) {
        userInfo.errors = errorMessage.getErrorMessage({
            statusCode: "400",
            errorId: "VALIDA1000",
            templateParams: {
                name: "emailAddress"
            },
            sourceError: "#email",
            displayMsg: "This field is required",
            errorMessage: "Email address is null",
            sourceLocation: sourceLocation
        });
    }

    if (userInfo.data.userNameDisplay === null) {
        userInfo.errors = errorMessage.getErrorMessage({
            statusCode: "400",
            errorId: "VALIDA1000",
            templateParams: {
                name: "userNameDisplay"
            },
            sourceError: "#username",
            displayMsg: "This field is required",
            errorMessage: "userNameDisplay is null",
            sourceLocation: sourceLocation
        });
    }

    return UserModel.findOne({emailAddress: userInfo.data.emailAddress}).exec()
        .then(function (email) {
            if (email) {
                return socialCrud.findByUserId(email._id)
                    .then(function (social) {
                        var errors = {
                            statusCode: "400",
                            errorId: "VALIDA1000",
                            templateParams: {
                                name: "emailAddress"
                            },
                            sourceError: "#email",
                            errorMessage: "Email already exists",
                            sourceLocation: sourceLocation
                        };

                        if (social) {
                            errors.displayMsg = "Email already exists. Please reset password.";
                        } else {
                            errors.displayMsg = "Email already exists";
                        }
                        userInfo.errors = errorMessage.getErrorMessage(errors);
                        return userInfo;
                    })
                    .then(function () {
                        return UserModel.findOne({userNameDisplay: userInfo.data.userNameDisplay}).exec();
                    });
            }

            if (userInfo.data.emailAddress !== null) {
                email = userInfo.data.emailAddress;
                var regex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}/g;
                var checkEmail = email.match(regex);
                if (!checkEmail) {
                    userInfo.errors = errorMessage.getErrorMessage({
                        statusCode: "400",
                        errorId: "VALIDA1000",
                        templateParams: {
                            name: "emailAddress"
                        },
                        sourceError: "#email",
                        displayMsg: "Please enter a vaild email address",
                        errorMessage: "Invalid Email",
                        sourceLocation: sourceLocation
                    });
                }

                return UserModel.findOne({userNameDisplay: userInfo.data.userNameDisplay}).exec();
            }

        })
        .then(function (userNameDisplay) {
            if (userNameDisplay) {
                userInfo.errors = errorMessage.getErrorMessage({
                    statusCode: "400",
                    errorId: "VALIDA1000",
                    templateParams: {
                        name: "userName"
                    },
                    sourceError: '#username',
                    displayMsg: "Username already exists",
                    errorMessage: "Username already exists",
                    sourceLocation: sourceLocation
                });
            }
            // replace illegal characters
            if (userInfo.data.userNameDisplay) {
                userInfo.data.userNameUrl = UserModel.purgeUserNameDisplay(userInfo.data.userNameDisplay);
            }
            return userInfo;
        });

};


var ValidateUserName = function (id, params) {
    if (params.userNameDisplay) {
        return UserModel.findOne({userNameDisplay: params.userNameDisplay})
            .lean()
            .exec()
            .then(function (user) {
                if (user && user._id !== id) {
                    return Promise.reject('Username already exists');
                }
            });
    }

    return Promise.resolve();
};

var ValidateEmailAddress = function (id, params) {
    if (params.emailAddress) {
        return UserModel.findOne({emailAddress: params.emailAddress})
            .then(function (user) {
                if (user && user._id !== id) {
                    return Promise.reject('Email already exists');
                }
            });
    }

    return Promise.resolve();
};

var ValidatePassword = function (id, params) {
    if (params.newPassword !== params.confirmPassword) {
        return Promise.reject('Passwords do not match');
    }

    return UserModel.findById(id).exec()
        .then(function (user) {
            if (!user.validPassword(params.oldPassword)) {
                return Promise.reject('Current password does not match');
            }
            return Promise.resolve();
        });
};

/*
 * @param params {Object}
 * @param params.sourceLocation {string} - location where the error initiates.
 */
users.prototype.validateUpdateUser = function (id, params) {
    return Promise.all([
        ValidateUserName(id, params),
        ValidateEmailAddress(id, params),
        ValidatePassword(id, params)
    ]);
};

/*
 * Create a new Users document.
 */
users.prototype.create = function (params) {
    logger.debug('made it into user create');
    var validation = this.validateCreateUser(params);
    return validation.then(function (userInfo) {
        if (userInfo.errors) {
            console.log(userInfo.errors);
            throw userInfo.errors;
        } else {
            // Persist
            var saveUser = new UserModel(userInfo.data);
            if (params.social) {
                saveUser.userNameDisplay = saveUser._id;
                saveUser.userNameUrl = saveUser._id;
            }
            if (saveUser.password) {
                logger.debug('hash password');
                saveUser.password = UserModel.generateHash(saveUser.password);
            }
            return saveUser.save();
        }
    });
};

/*
 * Get all users
 */
users.prototype.getAllUsers = function () {
    return (new Promise(function (resolve, reject) {
        UserModel.find({}).exec()
            .then(function (allUsers) {
                var param = {
                    status: "200",
                    message: "Okay",
                    users: allUsers
                };
                resolve(param);
            })
            .error(function (e) {
                var errorMessage = new ErrorMessage();
                errorMessage.getErrorMessage({
                    statusCode: "500",
                    errorId: "PERS1000",
                    errorMessage: "Failed while getting users",
                    sourceError: e,
                    sourceLocation: "persistence.crud.Users.getAllAusers"
                });
                reject(errorMessage.getErrors());
            });
    }));
};

/*
 * Get a user by ID
 */
users.prototype.getUserById = function (userId) {
    logger.debug('searching for user by userId: ' + userId);
    var validation = {};
    if (userId) {
        validation.userId = userId;
    } else {
        validation.userId = null;
        var errorMessage = new ErrorMessage();
        errorMessage.getErrorMessage({
            statusCode: "500",
            errorId: "PERS1000",
            errorMessage: "Failed while getting user by Id",
            sourceError: "Invalid UserId",
            sourceLocation: "persistence.crud.Users.getUserById"
        });
        validation.errors = errorMessage;
    }

    return (new Promise(function (resolve, reject) {
        if (validation.userId === null) {
            reject(validation.errors);
        } else {
            UserModel.findOne({_id: validation.userId})
                .select('aclRoles emailAddress userNameDisplay userNameUrl lastName firstName profilePicture autoPlay coverPicture aboutMe status allowHire allowDonation socialMediaLinks isSubscribeAirVuzNews')
                .lean()
                .then(function (user) {
                    if (user.profilePicture.indexOf('http') > -1) {
                        user.externalLink = true;
                    } else if (user.profilePicture === '') {
                        return socialCrud.findByUserIdAndProvider(user._id, 'facebook')
                            .then(function (social) {
                                if (social) {
                                    user.externalLink = true;
                                    user.profilePicture = '//graph.facebook.com/' + social.accountId + '/picture?type=large';
                                }
                                return user;
                            });
                    }
                    return user;
                })
                .then(function (user) {
                    resolve(user)
                })
                .catch(function (error) {
                    var errorMessage = new ErrorMessage();
                    errorMessage.getErrorMessage({
                        statusCode: "500",
                        errorId: "PERS1000",
                        errorMessage: "Failed while getting user by Id",
                        sourceError: error,
                        sourceLocation: "persistence.crud.Users.getAllAusers"
                    });
                    reject(errorMessage.getErrors());
                })
        }
    }));
};

/*
 * Get a user by social media ID
 */
users.prototype.getUserBySocialId = function (socialId) {
    logger.debug('searching for user by socialId: ' + socialId);
    var validation = {};

    if (socialId) {
        validation.socialId = socialId;
    } else {
        validation.socialId = null;

        var errorMessage = new ErrorMessage();
        errorMessage.getErrorMessage({
            statusCode: "500",
            errorId: "PERS1000",
            errorMessage: "Failed while getting user by Id",
            sourceError: "Invalid socialId",
            sourceLocation: "persistence.crud.Users.getUserBySocialId"
        });
        validation.errors = errorMessage;
    }

    return (new Promise(function (resolve, reject) {
        if (validation.errors) {
            logger.debug('validation errors exist');
            reject(validation.errors);
        } else {
            UserModel.find({socialMediaAccounts: validation.socialId},
                function (error, user) {
                    if (error) {
                        var errorMessage = new ErrorMessage();
                        errorMessage.getErrorMessage({
                            statusCode: "500",
                            errorId: "PERS1000",
                            errorMessage: "Failed while getting user by social Id",
                            sourceError: error,
                            sourceLocation: "persistence.crud.Users.getUserBySocialId"
                        });
                        reject(errorMessage.getErrors());
                    } else {
                        logger.debug('here is your user');
                        logger.debug(user);
                        resolve(user);
                    }
                });
        }

    }));
};

/**
 * get a user by email
 * @param email
 * @returns {Promise}
 */
users.prototype.getUserByEmail = function (email) {
    if (!email) {
        return Promise.reject('Email required');
    }
    return UserModel.findOne({emailAddress: email.toLowerCase()}).exec();
};

/**
 * delete a user by id
 * @param id
 * @returns {Promise}
 */
users.prototype.remove = function (id) {
    return UserModel.findByIdAndRemove(id).exec();
};
/**
 * update user information
 * @param id
 * @param params
 */
users.prototype.update = function (id, params) {
    return this.validateUpdateUser(id, params)
        .then(function () {
            if (params.userNameDisplay) {
                // update the userNameUrl also
                params.userNameUrl = UserModel.purgeUserNameDisplay(params.userNameDisplay);
            }
            if (params.oldPassword) {
                var pw = UserModel.generateHash(params.newPassword);
                delete params.oldPassword;
                delete params.newPassword;
                delete params.confirmPassword;
                params.password = pw;
            }

            return UserModel.findByIdAndUpdate(id, params, {new: true}).exec()
                .then(function (user) {
                    if (user._doc.password) {
                        user._doc.password = null;
                    }
                    return user;
                });
        });
};

/*
 * Delete
 */
users.prototype.delete = function (userId) {
    var validation = {};
    if (userId) {
        validation.userId = userId;
    } else {
        validation.userId = null;
        var errorMessage = new ErrorMessage();
        errorMessage.getErrorMessage({
            statusCode: "500",
            errorId: "PERS1000",
            errorMessage: "Failed while deleting user by Id",
            sourceError: "Invalid Id",
            sourceLocation: "persistence.crud.Users.delete"
        });

        validation.errors = errorMessage;
    }

    return (new Promise(function (resolve, reject) {
        if (validation.userId === null) {
            reject(validation.errors);
        } else {
            UserModel.delete({_id: validation.userId}, function (error, user) {
                if (error) {
                    var errorMessage = new ErrorMessage();
                    errorMessage.getErrorMessage({
                        statusCode: "500",
                        errorMessage: "Failed while deleting user by Id",
                        sourceError: error,
                        sourceLocation: "persistence.crud.Users.delete"
                    });
                    reject(errorMessage.getErrors());
                } else {
                    resolve(user);
                }
            });
        }
    }));
};

/**
 * check if email need to be confirm if so change status to active
 *
 * @param userId
 * @returns {Boolean}
 */
function emailConfirm(userId) {
    return UserModel.findOne({_id: userId}).exec()
      .then(function (user) {
          if (user && user.status === 'email-confirm') {
              user.status = 'active';
              return user.save().return(true);
          }
          return false;
      });
}

users.prototype.findById = function (id) {
    return UserModel.findById(id).exec();
};

users.prototype.getEmployeeContributor = function () {
    return UserModel.find({$or: [{aclRoles: 'user-employee'}, {aclRoles: 'user-contributor'}]})
};

users.prototype.totalUsersByEndDate = function (endDate) {
    return UserModel.find({accountCreatedDate: {$lte: new Date(endDate)}})
        .count()
        .exec()
};

users.prototype.newUsersBetweenDates = function (startDate, endDate) {
    return UserModel.find({accountCreatedDate: {$gte: new Date(startDate), $lte: new Date(endDate)}})
        .count()
        .exec()
};

users.prototype.newUserList = function (startDate, endDate) {
    return UserModel.find({accountCreatedDate: {$gte: new Date(startDate), $lte: new Date(endDate)}})
        .select('-_id emailAddress userNameDisplay userNameUrl accountCreatedDate allowDonation allowHire')
        .lean()
        .exec()
};

users.prototype.getByUserName = function (username) {
    return UserModel.findOne({userNameDisplay: username}).exec();
};

users.prototype.addAclRole = function (userId, role) {
    return UserModel.findByIdAndUpdate(userId, {$addToSet: {aclRoles: role}}, {new: true}).exec();
};

users.prototype.removeAclRole = function (userId, role) {
    console.log(userId);
    console.log(role);
    return UserModel.findByIdAndUpdate(userId, {$pull: {aclRoles: role}}, {new: true}).exec();
    // .then(function(user) {
    // 	return user.save();
    // })
};

function updateRoles(params) {
    // TODO: implement
}

function resetPasswordRequest(email) {
    return UserModel.findOne({emailAddress: email}).exec()
        .then(function (user) {
            if (!user) {
                throw 'Email does not exists.';
            }

            // random string in hex to prevent adding "/" "+"
            user.resetPasswordCode = crypto.randomBytes(10).toString('hex');

            return user.save();
        });
}

function resetPasswordChange(code, newPassword) {
    return UserModel.findOne({resetPasswordCode: code}).exec()
        .then(function (user) {
            if (!user) {
                throw 'No reset code exists';
            }
            user.password = UserModel.generateHash(newPassword);

            user.resetPasswordCode = undefined;
            return user.save();
        });
}

/**
 * get user by user name url / user name display
 * @param userNameUrl
 * @returns {Promise}
 */
function getUserByUserNameUrl(userNameUrl) {
    var validation = {};

    if (userNameUrl) {
        validation.userNameUrl = UserModel.purgeUserNameDisplay(userNameUrl);
    } else {
        validation.userNameUrl = null;
        var errorMessage = new ErrorMessage();
        errorMessage.getErrorMessage({
            statusCode: "500",
            errorId: "PERS1000",
            errorMessage: "Failed while getting user by userNameUrl",
            sourceError: "Invalid userNameUrl",
            sourceLocation: "persistence.crud.Users.getUserByUserNameUrl"
        });
        validation.errors = errorMessage;
        return Promise.reject(validation.errors);
    }

    return UserModel.findOne(validation)
        .select('-password')
        .lean()
        .exec();
}

function updateStatus(userId, status) {
    return UserModel.findOneAndUpdate({_id: userId}, {status: status}).exec();
}

function verifyStatus(userId) {
    return UserModel.findOne({_id: userId}).select('status aclRoles').lean().exec();
}

function updateImage(userId, path, type) {
    var update = {};

    update[type] = path;
    return UserModel.findOneAndUpdate({_id: userId}, update).exec();
}

users.prototype.updateRoles = updateRoles;
users.prototype.resetPasswordRequest = resetPasswordRequest;
users.prototype.resetPasswordChange = resetPasswordChange;
users.prototype.getUserByUserNameUrl = getUserByUserNameUrl;
users.prototype.updateStatus = updateStatus;
users.prototype.verifyStatus = verifyStatus;
users.prototype.emailConfirm = emailConfirm;
users.prototype.updateImage = updateImage;

module.exports = new users();
