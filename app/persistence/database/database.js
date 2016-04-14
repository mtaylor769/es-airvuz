var fs													= require('fs');
var log4js											= require('log4js');
var logger											= log4js.getLogger('app.persistence.database.Database');
var mongoose										= require('mongoose');
var path												= require('path');
var ENV													= process.env;

// set Promise provider to bluebird
mongoose.Promise = require('bluebird');

if(global.NODE_ENV === "production") {
	logger.setLevel("INFO");	
}

var Database = function() {
	logger.debug("constructor init ***********************************************");
	var currentDir	= __dirname;
	
	//var rootDir			= currentDir + "/../../../";
	var rootDir			= currentDir + path.sep + ".." + path.sep + ".." + path.sep + ".." + path.sep;
	//var modelDir		= "app/persistence/model/";
	var modelDir		= "app" + path.sep + "persistence" + path.sep + "model" + path.sep;
	//var modelDir		= "app/persistence/model";
	var modelDir		= "app" + path.sep + "persistence" + path.sep + "model";
	logger.debug("constructor - currentDir:" + currentDir);
	logger.debug("constructor - rootDir:" + rootDir);
	
	
	this.config = {
		modelDirFullPath : rootDir + modelDir,
		modelDirSubPath  : modelDir
	}
	
	logger.debug("constructor - this.config.modelDirFullPath: " + this.config.modelDirFullPath);
	logger.debug("constructor - this.config.modelDirSubPath: " + this.config.modelDirSubPath);
	
	logger.debug("started");
	this.dbConnections	= {};
	
	/*
	 * this.model["app.persistence.model.events.login"] = {
	 *		connectionName	: "",
	 *		modelName				: ""
	 * }
	 */
	this.modelByDotPath					= {};
	this._init();
}

Database.prototype._addConnectionEvents = function(params) {
	var conn		= params.conn;
	var dbInfo	= params.dbInfo;
	
	logger.debug("_addConnectionEvents: " + dbInfo.connectionName);
  conn.once('connected', function() {
		logger.debug("_addConnectionEvents: connected to [" + dbInfo.connectionName + "] host: '" + dbInfo.hostName + "', dbname: '" + dbInfo.databaseName + "'");
  });
	
  conn.on('error',function (err) {
		logger.error("_addConnectionEvents: connected error to [" + dbInfo.connectionName + "] host: '" + dbInfo.hostName + "', dbname: '" + dbInfo.databaseName + "'");
  });

  conn.on('disconnected', function () {
    logger.error("_addConnectionEvents: disconnected from [" + dbInfo.connectionName + "] host: '" + dbInfo.hostName + "', dbname: '" + dbInfo.databaseName + "'");
  });

  process.on('SIGINT', function() {
    conn.close(function () {
			logger.error("_addConnectionEvents: disconnected through app termination [" + dbInfo.connectionName + "] host: '" + dbInfo.hostName + "', dbname: '" + dbInfo.databaseName + "'");
      process.exit(0);
    });
  });	
}

Database.prototype._init = function() {
	var modelDirectory		= "";
	
	var connections = {
		databaseConnections : [
			{
				connectionName	: "events",
				hostName				: ENV.DATABASE_HOST || "localhost",
				databaseName		: "AirVuzEvents"
			},
			{
				connectionName	: "main",
				hostName				: ENV.DATABASE_HOST || "localhost",
				databaseName		: "AirVuz2"
			}			
		],
		paths : [
			{ 
				path						: path.sep  //"/"
			},			
			{ 
				path						: path.sep + "events" + path.sep   // "/events/"
			},
			{
				path						: path.sep + "main" + path.sep // "/main/"
			}
		]
	}
	
	this._initConnections({ connections : connections });

}

Database.prototype._initConnections = function(params) {
	logger.debug("_initConnections: " + JSON.stringify(params));
	
	
	var connections					= null;
	var connectionsIndex		= -1;
	var connectionsSize			= -1;
	var connection					= null;
	var connectionName			= null;
	var connectionStr				= null;
	var databaseConnection	= null;
	var databaseConnections	= null;
	var modelName						= "";
	var modelObject					= null;
	var modelPath						= "";
	var schema							= null;
	var pathIndex						= -1;
	var pathSize						= -1;
	//var path								= null;
	var paths								= null;
	var THIS								= this;
	var databaseOption			= {
		user	: ENV.DATABASE_USER || '',
		pass	: ENV.DATABASE_PASSWORD || '',
		auth	: {
			authdb: 'admin'
		}
	};
	
	connections					= params.connections;
	databaseConnections = connections.databaseConnections;
	connectionsSize			= databaseConnections.length;	
	
	// Init all the database connections
	for(connectionsIndex = 0; connectionsIndex < connectionsSize; connectionsIndex++) {
		databaseConnection	= databaseConnections[connectionsIndex];	
		connectionStr				= 'mongodb://' + databaseConnection.hostName + '/' + databaseConnection.databaseName;

		logger.debug("_initConnections: database [" + databaseConnection.connectionName + "] : " + connectionStr);

		try {
			connection = mongoose.createConnection(databaseConnection.hostName, databaseConnection.databaseName, 27017, databaseOption);

			this.dbConnections[databaseConnection.connectionName] = connection;

			this._addConnectionEvents({
				conn		: connection,
				dbInfo	: databaseConnection
			});	

			logger.debug("_initConnections: connected - database [" + databaseConnection.connectionName + "] : " + connectionStr);
		}
		catch(exception) {
			logger.error("_initConnections: error database [" + databaseConnection.connectionName + "] : " + connectionStr + " " + exception);
		}
		finally {

		}
	
	}
	
	// Init all the paths
	paths			= connections.paths;
	pathSize	= paths.length;
	for(pathIndex = 0; pathIndex < pathSize; pathIndex++) {
		modelRootPath = THIS.config.modelDirFullPath + paths[pathIndex].path;
		logger.debug("_initConnections: path: " + modelRootPath);
		logger.debug("_initConnections: -------------------------------------------- ");
		
		
		fs.readdirSync(modelRootPath).forEach(function(file) {
			logger.info(file);
			//modelPath = modelRootPath + path.sep + file;
			modelPath = modelRootPath + file;
			//logger.debug("_initConnections: modelPath: " + modelPath);
			//logger.debug("_initConnections: file: " + modelPath);
			
			var isFile = fs.lstatSync(modelPath).isFile();
			//logger.debug("_initConnections: isFile: " + isFile);			
			if(isFile) {
				modelObject			= require(modelPath);
				connectionName	= modelObject.connectionName || null;

				/*
				if(connectionName === null) {
					logger.error("_initConnections model missing .export with connectionName: '" + modelRootPath);	
					continue;
				}*/

				if(connectionName !== null) {

					modelSubPath = THIS.config.modelDirSubPath + paths[pathIndex].path + file;
					//logger.debug("_initConnections: modelSubPath: " + modelSubPath);
					// remove .js file extension
					modelDotName = modelSubPath.slice(0, -3);
					// convert path separators to '.', ie '/' becomes '.'
					modelDotName = modelDotName.split(path.sep).join(".");				
					logger.debug("_initConnections: modelDotName *******: " + modelDotName);

					logger.debug("_initConnections: connectionName: " + connectionName);
					modelName						= modelObject.modelName;
					schema							= modelObject.schema;

					databaseConnection = THIS.dbConnections[connectionName];
					logger.debug('connection name : ' + connectionName);
					logger.debug('databaseConnection : ' + databaseConnection);
					databaseConnection.model(modelName, schema);


					THIS.modelByDotPath[modelDotName] = {
						connectionName	: connectionName,
						modelName				: modelName
					}
					logger.debug("_initConnections loading model: '" + modelDotName + "' to connection: '" + connectionName + "'");	

				}
				else {//if(connectionName === null) {
					logger.error("_initConnections model missing .export with connectionName: '" + modelPath);	

				}		
			
			}
			
		});
		
	}

	require('../../../app/utils/acl').init(this.dbConnections['main'].db);
}


Database.prototype._initConnection2 = function(params) {
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

	dbInfo				= params.dbInfo;
	connectionStr = 'mongodb://' + dbInfo.hostName + '/' + dbInfo.databaseName;
	
	logger.debug("database [" + dbInfo.connectionName + "] : " + connectionStr);
	connection = mongoose.createConnection(connectionStr);

	fs.readdirSync(THIS.config.modelDirFullPath + dbInfo.connectionName).forEach(function(file) {
		modelPath = THIS.config.modelDirFullPath + dbInfo.connectionName + "/" + file;
		
		logger.debug("._initMain modelPath:" + modelPath);
		
		modelSubPath = THIS.config.modelDirSubPath + dbInfo.connectionName + path.sep + file;
		// remove .js file extension
		modelDotName = modelSubPath.slice(0, -3);
		// convert path separators to '.', ie '/' becomes '.'
		modelDotName = modelDotName.split(path.sep).join(".");
		logger.debug("")
		
		model			= require(modelPath);
		
		logger.debug("._initMain model name:" + model.modelName);
		logger.debug("._initMain schema:" + model.schema.constructor.name);
		logger.debug("._initMain schema typeof:" + typeof(model.schema));
		connection.model(model.modelName, model.schema);

		THIS.modelByDotPath[modelDotName] = {
			connectionName	: dbInfo.connectionName,
			modelName				: model.modelName
		}
		logger.debug("._initMain loading model:" + model.modelName);
  });
	
	this.dbConnections[dbInfo.connectionName] = connection;
	
	this._addConnectionEvents({
		conn		: connection,
		dbInfo	: dbInfo
	});
}

Database.prototype.getModelByDotPath = function(params) {
	var modelDotPath				= params.modelDotPath || null;
	logger.debug("modelDotPath: '" + modelDotPath + "'");
	if(modelDotPath === null) {
		logger.error("getModelByDotPath: params.modelDotPath missing.");
		throw new Exception("app.persistence.database.Database.getModelByDotPath: params.modelDotPath missing.");
	}
	
	var modelDotPathObject	= this.modelByDotPath[modelDotPath] || null;
	if(modelDotPathObject === null) {
		logger.error("getModelByDotPath: params.modelDotPath : '" + modelDotPath + "' not found.");
		logger.error("getModelByDotPath: typeof(modelDotPathObject):" + typeof(modelDotPathObject));
		logger.error("getModelByDotPath: JSON.stringify(modelDotPathObject):" + JSON.stringify(this.modelByDotPath));
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

Database.prototype._loadModelDirectory = function(params) {
	var modelDirectory = params.modelDirectory;
	logger.debug("_loadModelDirectory - modelDirectory:" + modelDirectory);
	
	fs.readdirSync(modelDirectory).forEach(function(file) {
		//modelPath = THIS.config.modelDirFullPath + dbInfo.connectionName + "/" + file;
		logger.debug("_loadModelDirectory - file:" + file);
		

  });	
}

module.exports = new Database();