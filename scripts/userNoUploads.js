try {
    var log4js = require('log4js');
    var logger = log4js.getLogger('scripts.autovuz-test.js');
    var mongoose = require('mongoose');
    var Promise = require('bluebird');
    var Video = null;

    var DATABASE_HOST = process.env.DATABASE_HOST || 'localhost';
    var databaseOptions = {
        user: process.env.DATABASE_USER || '',
        pass: process.env.DATABASE_PASSWORD || '',
        auth: {
            authdb: 'admin'
        }
    };

    mongoose.Promise = require('bluebird');
    mongoose.connect('mongodb://' + DATABASE_HOST + '/AirVuz2', databaseOptions);

    UserModel = mongoose.model('User', require('../app/persistence/model/users.js').schema);
    VideoModel = mongoose.model('Video', require('../app/persistence/model/videos.js').schema);


    var args = process.argv.slice(2);
    var minVideoCount = 0;
    if (args[0]) {
        minVideoCount = args[0];
    }

    mongoose.connection.once('connected', function () {

        VideoModel.aggregate([
            {
                $group: {
                    _id: '$userId',
                    count: {$sum: 1}
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userObject'
                }
            },
            {
                $sort: {
                    count: -1
                }

            }
        ]).exec()
            .then(function (userData) {
                var numUsers = userData.length;
                var usersWithVideos = [];
                for (userIndex = 0; userIndex < numUsers; userIndex++) {
                    usersWithVideos.push (userData[userIndex].userObject[0]._id);
                }

                var usersNoVideos = UserModel.find (
                    { _id: { $not: { $in: usersWithVideos }} }
                ).exec();

                usersNoVideos
                    .then (function (usersNoVideos){
                        var numUsersNoVideos = usersNoVideos.length;
                        var userIndex = 0;
                        var strOut;
                        var firstName;
                        var lastName;

                        for (userIndex; userIndex < numUsersNoVideos; userIndex++){
                            firstName='';
                            lastName='';
                            if (usersNoVideos[userIndex].firstName !== undefined) {
                                firstName = usersNoVideos[userIndex].firstName;
                            }
                            if (usersNoVideos[userIndex].lastName !== undefined) {
                                lastName = usersNoVideos[userIndex].lastName;
                            }
                            strOut =  firstName + ',';
                            strOut += lastName + ',';
                            strOut += usersNoVideos[userIndex].emailAddress + ',';
                            console.log (strOut);
                        }
                    })
                    .catch(function (err) {
                        logger.error (err);
                    })
                    .finally(function () {
                        closeDatabaseConnection;
                        process.exit();
                    });

            })
            .catch(function (err) {
                logger.error (err);
            })


        /*
         UserModel.find (
         { _id: { $not: { $in: ['57f51f1d20e26b22f9138f27' ] }} }
         ).exec()
         .then ( function (userData) {
         var numUsers = userData.length;
         var userIndex;
         var strOut;

         var noop;
         console.log ('count: ' + numUsers);

         for (userIndex=0; userIndex < numUsers; userIndex++){
         if ( userIndex == 0) {
         console.log (userData[userIndex]);
         var noop;
         }
         }

         })
         .catch ( function (err) {
         logger.error (err);
         })
         .finally( function () {
         closeDatabaseConnection;
         process.exit();
         });
         */

    });


    function closeDatabaseConnection() {
        mongoose.connection.close();
        console.log('******************** close database connection ********************');
    }


}
catch (error) {
    console.log("error: " + error);
}