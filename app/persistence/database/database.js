var fs													= require('fs');
var log4js											= require('log4js');
var logger											= log4js.getLogger('app.persistence.database');
var mongoose										= require('mongoose');
var path												= require('path');

var Database = function() {
	logger.debug("constructor init ***********************************************");
	
	
	var currentDir	= __dirname;
	var rootDir			= currentDir + "/../../../";
	var modelDir		= "app/persistence/model/";
	
	logger.debug("rootDir:" + rootDir);
	
	this.config = {
		modelDirFullPath : rootDir + modelDir,
		modelDirSubPath  : modelDir
	}
	
	logger.debug("started");
	this.dbConnections	= {};
	
	/*
	 * this.model["app.persistence.model.events.login"] = {
	 *		connectionName	: "",
	 *		modelName				: ""
	 * }
	 */
	this.modelByDotPath					= {};
	this._initConnections();
}

Database.prototype._addConnectionEvents = function(params) {
	var conn		= params.conn;
	var dbInfo	= params.dbInfo;
	
	logger.debug("._addConnectionEvents: " + dbInfo.NAME);
  conn.once('connected', function() {
		logger.debug("._addConnectionEvents: connected to [" + dbInfo.NAME + "] host: '" + dbInfo.HOST + "', dbname: '" + dbInfo.DBNAME + "'");
  });
	
	
  conn.on('error',function (err) {
		logger.error("._addConnectionEvents: connected error to [" + dbInfo.NAME + "] host: '" + dbInfo.HOST + "', dbname: '" + dbInfo.DBNAME + "'");
  });

  conn.on('disconnected', function () {
    logger.error("._addConnectionEvents: disconnected from [" + dbInfo.NAME + "] host: '" + dbInfo.HOST + "', dbname: '" + dbInfo.DBNAME + "'");
  });

  process.on('SIGINT', function() {
    conn.close(function () {
			logger.error("._addConnectionEvents: disconnected through app termination [" + dbInfo.NAME + "] host: '" + dbInfo.HOST + "', dbname: '" + dbInfo.DBNAME + "'");
      //process.exit(0);
    });
  });	
}

Database.prototype._initConnections = function() {

	this._initConnection({
		dbInfo : {
			NAME		: "events",
			HOST		: "localhost",
			DBNAME	: "AirVuzEvents"
		}
	});	
	
	
	this._initConnection({
		dbInfo : {
			NAME		: "main",
			HOST		: "localhost",
			DBNAME	: "AirVuzV2"
		}
	});
	
}

Database.prototype._initConnection = function(params) {
	/*
	 * The database connection
	 */
	var connection		= null;
	var connectionStr	= "";
	var dbInfo				= null;
	var model					= null;
	var modelDotName	= "";
	var modelPath			= null;
	var modelSubPath	= "";
	var THIS					= this;

	dbInfo = params.dbInfo;
	
	connectionStr = 'mongodb://' + dbInfo.HOST + '/' + dbInfo.DBNAME;
	logger.debug("database [" + dbInfo.NAME + "] : " + connectionStr);

	connection = mongoose.createConnection(connectionStr);
	
  //fs.readdirSync(__dirname + '/../model/' + dbInfo.NAME).forEach(function(file) {
	fs.readdirSync(THIS.config.modelDirFullPath + dbInfo.NAME).forEach(function(file) {
		//modelPath = __dirname + "/../model/" +dbInfo.NAME + "/" + file;
				
		
		modelPath = THIS.config.modelDirFullPath + dbInfo.NAME + "/" + file;
		logger.debug("._initMain modelPath:" + modelPath);
		
		modelSubPath = THIS.config.modelDirSubPath + dbInfo.NAME + path.sep + file;
		// remove .js file extension
		modelDotName = modelSubPath.slice(0, -3);
		// convert path separators to '.', ie '/' becomes '.'
		modelDotName = modelDotName.split(path.sep).join(".");
		logger.debug("._initMain modelDotName:" + modelDotName);
		
		model			= require(modelPath);
		
		logger.debug("._initMain model name:" + model.name);
		logger.debug("._initMain schema:" + model.schema.constructor.name);
		logger.debug("._initMain schema typeof:" + typeof(model.schema));
		connection.model(model.name, model.schema);

		THIS.modelByDotPath[modelDotName] = {
			connectionName	: dbInfo.NAME,
			modelName				: model.name
		}
		logger.debug("._initMain loading model:" + model.name);
  });
	
	/*
	 * works:
	var aModel = connection.model(model.name);
	var event = new aModel();
	event.save(function(error, video) {
		if(error) {
			logger.debug("._initMain save failed:" + error);
		}
	});
	logger.debug("._initMain aModel:" + aModel.constructor.name);
	*/
	
	this.dbConnections[dbInfo.NAME] = connection;
	
	this._addConnectionEvents({
		conn		: connection,
		dbInfo	: dbInfo
	});
}

Database.prototype.getModelByDotPath = function(params) {
	var modelDotPath				= params.modelDotPath || null;
	logger.debug(" modelDotPath: '" + modelDotPath + "'");
	if(modelDotPath === null) {
		logger.error("getModelByDotPath: params.modelDotPath missing.");
		throw new Exception("app.persistence.database.Database.getModelByDotPath: params.modelDotPath missing.");
	}
	
	var modelDotPathObject	= this.modelByDotPath[modelDotPath] || null;
	if(modelDotPathObject === null) {
		logger.error("getModelByDotPath: params.modelDotPath : '" + modelDotPath + "' not found.");
		throw new Exception("app.persistence.database.Database.getModelByDotPath: params.modelDotPath : '" + modelDotPath + "' not found.");
	}
	 
	var model = this.getModelByName({
		connectionName	: modelDotPathObject.connectionName,
		modelName				: modelDotPathObject.modelName
	});
	
	return(model);
}

Database.prototype.getModelByName = function(params) {
	var connection			= null;
	var connectionName	= params.connectionName;
	var modelName				= params.modelName;
	var model						= null;

	logger.debug("getModelByName connectionName : '" + connectionName + "', modelName : '" + modelName + "'");
	connection			= this.dbConnections[connectionName] || null;
	
	if(connection === null) {
		logger.error("getModelByName connectionName : '" + connectionName + "', modelName : '" + modelName + "'");
		throw new Error("connection name:'" + connectionName + "' not found.");
	}
	
	logger.debug("getModelByName connection : " + connection);
	model						= connection.model(modelName);
	
	return(model);
}

module.exports = new Database();