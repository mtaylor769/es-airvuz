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
				logger.debug("_getDustRender: view:" + view);
				resolve(view);
			}
		})
		.catch(function(error) {
			logger.error("_getDustRender error:" + error);
		});
	});  	
}

ViewManager.prototype._isNewCacheViewNeeded = function(params) {
	var view = params.view;
	
	if(view.cacheTimeout > 0) {
		//logger.debug("_isNewCacheViewNeeded: checking cache ..." );
		
    var diffTime = new Date();
    diffTime.setSeconds(diffTime.getSeconds() - view.cacheTimeout);
		
		if(
			(view.lastRenderViewTime === -1)
			|| (diffTime > view.lastRenderViewTime)
		) {
			//logger.debug("_isNewCacheViewNeeded: need to render a cache page" );
			view.lastRenderViewTime = Date.now();
			logger.debug("_isNewCacheViewNeeded: view.lastRenderViewTime: " + view.lastRenderViewTime );
			return(true);
		}
		else {
			//logger.debug("_isNewCacheViewNeeded: !need to render a cache page" );
			return(false);
		}
		
	}	
	return(true);
	
}

ViewManager.prototype.getView = function(params) {
	logger.debug("getView: IN");
	
	var cachedView				= "";
	var reloadView				= false;
	var renderCachedView	= false;
	var renderNewView			= false;
	var view							= null;
	var viewConfig				= null;
	var viewData					= null;
	var viewName					= "";
	var viewPrettyPrint		= false;
	var THIS							= this;
	
	view = params.view || null;
	
	if(view === null) {
		//logger.error("getView: params.view === null");
	}
	delete params.view;
	
	reloadView			= params.request.query.reloadView || false;
	viewPrettyPrint = params.request.query.viewPrettyPrint || "false";
	
	if(reloadView) {
		viewConfig	= view.getViewConfig();
		this._loadSource(viewConfig);
		renderNewView = true;
	}
	
	if(this._isNewCacheViewNeeded({ view : view })) {
		//logger.debug("getView: need to render a cache page" );
		renderNewView = true;
	}
	else {
		//logger.debug("getView: using cached page" );
		//renderCachedView = true;
	}
	

	
	
	viewName				= view.getViewName();

	//logger.debug("getView: reloadView:" + reloadView);
	//logger.debug("getView: viewPrettyPrint:" + viewPrettyPrint);
	
	return new Promise(function(resolve, reject) {
		logger.debug("getView: renderNewView:" + renderNewView);
		//logger.debug("getView: renderCachedView:" + renderCachedView);
		//logger.debug("getView: viewName:" + viewName);
		//logger.debug("getView: viewPrettyPrint:" + viewPrettyPrint);
		
		if(!renderNewView) {
			logger.debug("getView: rendering cached view");
			cachedView = view.cachedView;
			if(viewPrettyPrint === "true") {
				//logger.debug("getView: doing pretty print");
				cachedView = html.prettyPrint(cachedView, {indent_size: 2});
			}
			resolve(cachedView);			
		}
		return;

		view
			.getData(params)
			.then(function(viewParams) {
				//logger.debug("getView: viewData:" + JSON.stringify(viewParams.data));
				return(THIS._getDustRender({
						viewName	: viewName,
						viewData	: viewParams.data
					})
				);
			})
			.then(function(htmlView) {		
				logger.debug("getView: rendering new view");
				view.cachedView = htmlView;
        if(viewPrettyPrint === "true") {
					logger.debug("getView: doing pretty print");
          htmlView = html.prettyPrint(htmlView, {indent_size: 2});
        }
				resolve(htmlView);
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