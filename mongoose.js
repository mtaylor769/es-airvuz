console.log("IN");
var mongoose = require('mongoose'),
  fs = require('fs');

var database = {
	HOST : "localhost",
	NAME : "AirVuzV2"
}

var secret = "B+`{<e}]C}HT<m<G";

function connectToDatabase() {
	var connectionStr = 'mongodb://' + database.HOST + '/' + database.NAME;
	console.log("connstr:" + connectionStr);
  mongoose.connect(connectionStr);

  addConnectionEvent();

  loadModels();
}

function loadModels() {
  console.log("__dirname" + __dirname);
  fs.readdirSync('./app/persistence/model').forEach(function(file) {
    console.log(file);
    if (!fs.lstatSync('./app/persistence/model/' + file).isDirectory()) {
      require('./app/persistence/model/' + file);
    }
  });
}

function addConnectionEvent() {
  mongoose.connection.once('connected', function() {
    console.log('******************** Connected to database ********************');
    require('./app/utils/acl');
  });

  mongoose.connection.on('error',function (err) {
    console.log('******************** Mongoose connection error: ********************');
    console.log(err);
    console.log('************************************************');
  });

  mongoose.connection.on('disconnected', function () {
    console.log('******************** Mongoose disconnected ********************');
  });

  process.on('SIGINT', function() {
    mongoose.connection.close(function () {
      console.log('******************** Mongoose disconnected through app termination ********************');
      process.exit(0);
    });
  });
}

connectToDatabase();