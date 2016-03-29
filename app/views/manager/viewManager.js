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
	
	//indexData.getViewConfig()
	//var view = new View(params);
	//this.views[params.pageName] = view;
	
	// load partials
	var view				= params.view;
	var viewConfig	= view.getViewConfig(); 
	
	this._loadSource(viewConfig);
	
}

ViewManager.prototype._getDustRender = function(params) {
	var viewName	= params.viewName;
	var viewData	= params.viewData;
	return new Promise(function(resolve) {
		//dust.render(params.viewName, params.data, function(error, view) {
		dust.render(viewName, viewData, function(error, view) {
			if(error) {
				logger.error("_getDustRender error:" + error);
			}
			else {
				//THIS.cachedPage[pageName].setCachedPage(output);
				
				//logger.debug("_getDustRender: typeof(html):" + typeof(html));
				/*
        if(viewPrettyPrint === "true") {
            view = html.prettyPrint(view, {indent_size: 2});
        }		
				*/
				
				logger.debug("_getDustRender: view:" + view);
				resolve(view);
			}
		})
		.catch(function(error) {
			logger.error("_getDustRender error:" + error);
		});
	});  	
}

ViewManager.prototype.getView = function(params) {
	logger.debug("getView: IN");
	
	var view						= null;
	var viewData				= null;
	var viewName				= "";
	var viewPrettyPrint = false;
	var THIS						= this;
	
	view = params.view || null;
	
	if(view === null) {
		logger.error("getView: params.view === null");
	}
	delete params.view;
	
	viewPrettyPrint = params.request.query.viewPrettyPrint || "false";
	viewName				= view.getViewName();

	logger.debug("getView: viewPrettyPrint:" + viewPrettyPrint);
	
	return new Promise(function(resolve, reject) {
		logger.debug("getView: viewName:" + viewName);
		logger.debug("getView: viewPrettyPrint:" + viewPrettyPrint);
		
		
		view
			.getData(params)
			.then(function(viewData) {
				return(THIS._getDustRender({
						viewName	: viewName,
						viewData	: viewData
					})
				);
			})
			.then(function(view) {
					resolve(view);
			})
			.catch(function(error) {
				logger.error("getView: forced failure");
				reject(error);
			})

	});  	
	
	
	/*
	return new Promise(function(resolve) {
		//dust.render(params.viewName, params.data, function(error, view) {
		dust.render(viewName, viewData, function(error, view) {
			if(error) {
				logger.error("getView error:" + error);
			}
			else {
				//THIS.cachedPage[pageName].setCachedPage(output);
				
				logger.debug("getView: typeof(html):" + typeof(html));
        if(viewPrettyPrint === "true") {
            view = html.prettyPrint(view, {indent_size: 2});
        }				
				
				logger.debug("getView: view:" + view);
				resolve(view);
			}
		})
		.catch(function(error) {
			logger.error("getView error:" + error);
		});


	});  	
	*/
}

var viewManager = new ViewManager();

module.exports = viewManager;