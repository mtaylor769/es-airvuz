var UsersCrud       = require('../../persistence/crud/users');
var SocialCrud      = require('../../persistence/crud/socialMediaAccount');

function findSocialAccount(data) {
  var account = SocialCrud.findAccountByIdandProvider(data.accountId, data.provider);
  account.then(function(accountInfo){
    if (accountInfo) {
      console.log('found a match in socialmediamodel now checking to see if user already exists');
      //var findUser = findUserByEmail(data, accountInfo);
      return accountInfo;
    } else {
      console.log('did not find a match in socialmediamodel');
      return null;
      // var newAccount = SocialCrud.create(data);
      // console.log('newAccount');
      // console.log(newAccount);
      // newAccount.then(function(newAccountData){
      //   if (newAccountData._id) {
      //     console.log('created new socialmediamodel data');
      //     var findUser = findUserByEmail(data, newAccountData);
      //     return findUser;
      //   } else {
      //     console.log('error on creating new socialmediamodel data');
      //     return error;
      //   }
      // });
    }
  });
}

function findUserByEmail(data) {
  var emailUser = UsersCrud.getUserByEmail(data.email);
  emailUser.then(function(user){
    if (user && user._id) {
      console.log('user email already exists');
      //update with social media id and return user
      return user;
    } else {
      console.log('user with this email does not already exist');
      return null;
    }
  });
}

function findUserBySocialId(data, account) {
  var findUser = UsersCrud.getUserBySocialId(account._id);
  console.log('findUser');
  console.log(findUser);
  findUser.then(function(user){
    if (user && user.length > 0) {
      console.log('found user by social id, email is different or has changed');
      //return user
      return user;
    } else {
      console.log('no user found by social id need to create a whole new user and assign socialmediamodel id');
      var userData = {
        userName : data.accountData.name.givenName + " " + data.accountData.name.familyName,
        firstName : data.accountData.name.givenName,
        lastName : data.accountData.name.familyName,
        emailAddress : data.email,
        socialMediaAccounts : account._id
      }
      var newUser = UsersCrud.create(userData);
      return newUser;
    }
  });
};

module.exports = {
  findUserByEmail     : findUserByEmail,
  findUserBySocialId  : findUserBySocialId,
  findSocialAccount   : findSocialAccount
}