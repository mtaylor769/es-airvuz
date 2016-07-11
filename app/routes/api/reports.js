var log4js					= require('log4js');
var logger					= log4js.getLogger('app.routes.api.videoLike');
var User            = require('../../persistence/crud/users');
var Videos           = require('../../persistence/crud/videos');

function Reports() {
  
}

Reports.prototype.getVideos = function(req, res) {
  var username = req.query.username;
  var startDate = req.query.startDate;
  var endDate = req.query.endDate;
  
  User.getByUsername(username).exec()
    .then(function(user) {
      return Videos.getByUserAndDate(user._id, startDate, endDate)
    })
    .then(function(videos) {
      res.send(videos)
    })
  
};

Reports.prototype.siteInfo = function(req, res) {
  logger.debug('REPORTS: IN');
  var endDate = req.query.endDate;
  var startDate = req.query.startDate;
  var totalUsers;
  var totalVideos;
  var newVideos;
  var newUsersCount;
  var newUsersList;
  var promises = [];


  promises.push(User.totalUsersByEndDate(endDate)
    .then(function(users) {
      totalUsers = users;
    })
  );

  promises.push(Videos.totalVideosByEndDate(endDate)
    .then(function(videos) {
      totalVideos = videos;
    })
  );

  promises.push(User.newUsersBetweenDates(startDate, endDate)
    .then(function(users) {
      newUsersCount = users;
    })
  );

  promises.push(Videos.newVideosBetweenDates(startDate, endDate)
    .then(function(videos) {
      newVideos = videos;
    })
  );

  promises.push(User.newUserList(startDate, endDate)
    .then(function(users) {
      newUsersList = users;
    })
  );

  Promise.all(promises)
    .then(function () {
      res.json({
        title: 'Site Info',
        totalUsers: totalUsers,
        totalVideos: totalVideos,
        newUsersCount: newUsersCount,
        newVideos: newVideos,
        newUsersList: newUsersList});
    });
};


module.exports = new Reports();