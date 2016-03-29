// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.manager.viewManager');

try {
	var dust			= require("dustjs-linkedin");
	var fs				= require("fs");
	var html			= require("html");
	var Promise		= require('bluebird');
	var View			= require('./view');

	if(global.NODE_ENV === "production") {
		logger.setLevel("WARN");	
	}

	logger.info("import complete");	
}
catch(exception) {
	logger.error(" import error:" + exception);
}
// IMPORT: END

var ViewManager = function() {
	
	/*
	 * @type{View}
	 */
	this.views = {};
	
}

/*
 * Read a dust file, compile, and load source to dust.
 */
ViewManager.prototype._loadSource = function(params) {
	logger.debug("_loadSource: params:" + JSON.stringify(params));
	var source      = fs.readFileSync(params.viewPath);
	var compiled    = dust.compile(new String(source), params.viewName);
	dust.loadSource(compiled);
}


ViewManager.prototype.addView = function(params) {
	logger.info("addView: IN");	
	
	//var view = new View(params);
	//this.views[params.pageName] = view;
	
	this._loadSource(params);
	
}


ViewManager.prototype.getView = function(params) {
	logger.debug("getView: IN");
	//logger.debug("getView: params:" + JSON.stringify(params));
	
	var viewPrettyPrint = params.request.query.pretty || "false";
	
	return new Promise(function(resolve) {
		var html = "<html><body>getView</body></html>";

		//resolve(html);
		
		

		dust.render(params.viewName, params.data, function(error, view) {
			if(error) {
				logger.error("getView error:" + error);
			}
			else {
				//THIS.cachedPage[pageName].setCachedPage(output);
				logger.debug("getView: view:" + view);
				resolve(view);
			}
		})
		.catch(function(error) {
			logger.error("getView error:" + error);
		});

			/*
			if(useCache && !forceNoCache) {
					resolve(THIS.cachedPage[pageName].getCachedPage());
			}
			else {        
					dust.render(pageName, data, function(error, output) {
						 THIS.cachedPage[pageName].setCachedPage(output);
						 resolve(output);
					})
					.catch(function(error) {
							console.log(".getPage error:" + error);
					});
			}
			*/
	});  	
	
}

var viewManager = new ViewManager();

module.exports = viewManager;