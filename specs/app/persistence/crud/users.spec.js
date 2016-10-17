describe('Users', function () {
    var Promise = require('bluebird');
    var Users = require('../../../../app/persistence/crud/users');
    var expect = require('chai').expect;
    var log4js = require('log4js');
    var logger = log4js.getLogger('app.persistence.crud.user.spec.js');

    var validUser = {
        emailAddress: "karl@karljones.com",
        password: "testABC124",
        confirmPassword: "testABC124",
        userName: "karljones",
        userNameDisplay: "Karl G. Jones",
        userNameUrl: "KarlG.Jones",
        firstName: "Karl",
        lastName: "Jones"
    }

    var validUserId = '';
//    validUserId = '580506fe3e3c0c32a75a5dd2';

    var validSocialId = '901463806634921';

    var validRole = 'user-general';

    var validStartDate = new Date('1 Jan 2015');    // arbitrary early date (before founding of Air Vuz)
    var validEndDate = new Date();

    //var validCode = '8484983a3dac7543f687';     // TODO:  get dynamically
    var validResetPasswordCode = '';


    var validStatus = 'email-confirm';  // TODO: enumerate valid options

    var validParams = {};

    validParams.coverPicture = '';
    validParams.emailAddress = '';
    validParams.userNameDisplay = '';
    validParams.aclRoles = 'user-general';
    validParams.profilePicture = '';
    validParams.isSubscribeAirVuzNews = '';
    validParams.social = '';
    validParams.password = '';
    validParams.confirmPassword = '';


    // create()
    describe('create', function () {
        it('should return an object after submitting valid parameters', function (done) {
            Users.create(validUser)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    validUserId = retVal._id;
                    logger.info (retVal);
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // validateCreateUser()
    describe('validateCreateUser', function () {
        it('should return ...', function (done) {
            Users.validateCreateUser(validParams)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // validateUpdateUser()
    describe('validateUpdateUser', function () {
        it('should return an object', function (done) {
            Users.validateUpdateUser(validUserId, validParams)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    done();
                })
                .catch(function (retVal) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // getAllUsers()
    describe('getAllUsers', function () {
        it('should return an object', function (done) {
            Users.getAllUsers()
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // getUserById()
    describe('getUserById', function () {
        it('should return an object for a valid User ID', function (done) {
            Users.getUserById(validUserId)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });

    });


    // getUserBySocialId()
    describe('getUserBySocialId', function () {
        it('should return an object', function (done) {
            Users.getUserBySocialId(validSocialId)
                .then(function (retVal) {
                    //expect(retVal).to.be.an('object');   // TODO: EXPECT ARRAY
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // getUserByEmail()
    describe('getUserByEmail', function () {
        it('should return an object', function (done) {
            Users.getUserByEmail(validUser.emailAddress)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // update()     // TODO finish
    /*
     describe('update()'
     function () {
     is('should return an object', function (done) {
     Users.update(validUserId, validParams)
     .then(function (retVal) {
     expect(retVal).to.be.an('object');
     done();
     })
     .catch(function (retVal) {
     logger.error(err);
     done();
     });
     });
     });
     */

    // emailConfirm()
    describe('emailConfirm()', function () {
        it('should return a string (either "true" or "false") after confirming email', function (done) {
            Users.emailConfirm(validUserId)
                .then(function (retVal) {
                    // retVal should be string, either "true" or "false"
                    // TODO: make emailConfirm() return Boolean instead of String
                    expect(retVal).to.satisfy(function (retVal) {
                        return retVal === 'true' || retVal === 'false';
                    });
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // findById()
    describe('findById()', function () {
        it('should return a User model object', function (done) {
            Users.findById(validUserId)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // getEmployeeContributor()
    describe('getEmployeeContributor()', function () {
        it('should return ... TODO, what?', function (done) {
            Users.getEmployeeContributor()
                .then(function (retVal) {
                    expect(user).to.be.an('object');
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // totalUsersByEndDate
    describe('', function () {
        it('should return a number greater than or equal to zero', function (done) {
            Users.totalUsersByEndDate(validEndDate)
                .then(function (retVal) {
                    expect(retVal).to.be.a('number');
                    expect(retVal).to.be.at.least(0);
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    //newUsersBetweenDates
    describe('newUsersBetweenDates()', function () {
        it('should return a number greater than or equal to zero', function (done) {
            Users.newUsersBetweenDates(validStartDate, validEndDate)
                .then(function (retVal) {
                    expect(retVal).to.be.a('number');
                    expect(retVal).to.be.at.least(0);
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // newUserList()
    describe('newUserList', function () {
        it('should return an array of objects', function (done) {
            Users.newUserList(validStartDate, validEndDate)
                .then(function (retVal) {
                    expect(retVal).to.be.instanceof(Array);
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // getByUserName()
    describe('should return a User object', function () {
        it('', function (done) {
            Users.getByUserName(validUser.userNameDisplay)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // addAclRole()
    describe('addAclRole', function () {
        it('should return ... after adding a role', function (done) {
            Users.addAclRole(validUserId, validRole)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // removeAclRole()
    describe('removeAclRole()', function () {
        it('should return ...', function (done) {
            Users.removeAclRole(validUserId, validRole)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    //updateRoles() =  source code TODO


    // resetPasswordRequest()
    describe('resetPasswordRequest', function () {
        it('should return ...', function (done) {
            Users.resetPasswordRequest(validUser.emailAddress)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    logger.info (retVal);
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // resetPasswordChange()
    describe('resetPasswordChange()', function () {
        it('should return ...', function (done) {
            Users.resetPasswordChange(validResetPasswordCode, validUser.password)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // getUserByUserNameUrl()
    describe('getUserByUserNameUrl()', function () {
        it('should return User object', function (done) {
            Users.getUserByUserNameUrl(validUser.userNameUrl)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // updateStatus()
    describe('updateStatus()', function () {
        it('should return a User model object', function (done) {
            Users.updateStatus(validUserId, validStatus)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // verifyStatus()
    describe('verifyStatus()', function () {
        it('should return a user model object', function (done) {
            Users.verifyStatus(validUserId)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    done();
                })
                .catch(function (err) {
                    logger.error(err);
                    throw new Error(err);
                });
        });
    });


    // remove()
    describe('remove valid User', function () {
        it('should return an object after removing (deleting) a valid User fron the database', function (done) {
            Users.remove(validUserId)
                .then(function (retVal) {
                    expect(retVal).to.be.an('object');
                    logger.info (retVal);
                    done();
                })
            .catch(function (err) {
                logger.error(err);
                throw new Error(err);
            });
        });
    });





});