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

    mongoose.connection.once('connected', function() {
        // logger.info ('connected');

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
            .then ( function (userData) {
                // logger.info (results);
                var numUsers = userData.length;
                var userIndex;
                var strOut;

                for (userIndex=0; userIndex < numUsers; userIndex++){
                    if ( userIndex == 0) {
                        // console.log (userData[userIndex]);
                    }
                    // logger.info (userData[userIndex]);
                    if (userData[userIndex].count >= minVideoCount) {
                        strOut = userData[userIndex].userObject[0].firstName + ',';
                        strOut += userData[userIndex].userObject[0].lastName + ',';
                        strOut += userData[userIndex].userObject[0].emailAddress + ',';
                        strOut += userData[userIndex].count;
                        console.log (strOut);
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


    });



    function closeDatabaseConnection() {
        mongoose.connection.close();
        console.log('******************** close database connection ********************');
    }


}
catch (error) {
        console.log("error: " + error);
}