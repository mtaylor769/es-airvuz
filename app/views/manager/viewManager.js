// IMPORT: BEGIN
var log4js		= require('log4js');
var logger		= log4js.getLogger('app.views.manager.viewManager');

try {
	var dust			= require("dustjs-helpers");
	var fs				= require("fs");
	var html			= require("html");
	var Promise		= require('bluebird');

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
	
};

/*
 * Read a dust file, compile, and load source to dust.
 */
ViewManager.prototype._loadSource = function(params) {
	logger.debug("_loadSource: params:" + JSON.stringify(params));
	
	params.partials = params.partials || [];
	
	var compiled			= null;
	var index					= 0;
	var partial				= null;
	var partialName		= "";
	var partialPath		= "";
	var partialSource = "";
	var size					= params.partials.length;
	
	// load partials
	if(size > 0) {
		logger.debug("_loadSource: loading partials ...");
		
		for(index = 0; index < size; index++) {
			partial = params.partials[index];
			partialName = partial.partialName;
			partialPath = partial.partialPath;
			
			
			partialSource = fs.readFileSync(partialPath);
			compiled			= dust.compile(new String(partialSource), partialName);
			dust.loadSource(compiled);			
			
			logger.debug("_loadSource: loading partials:" + partialPath);
			
		}
	}	
	
	// load primary view
	var source      = fs.readFileSync(params.viewPath);
	var compiled    = dust.compile(new String(source), params.viewName);
	dust.loadSource(compiled);
};


ViewManager.prototype.addView = function(params) {
	logger.info("addView: IN");
	
	var view				= params.view;
	var viewConfig	= view.getViewConfig();

	this.views[view.getViewName()] = view;
	this._loadSource(viewConfig);
};

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
				resolve(view);
			}
		})
		.catch(function(error) {
			logger.error("_getDustRender error:" + error);
		});
	});  	
};

/*
 * Determine if the cache is stale.
 */
ViewManager.prototype._isNewCacheViewNeeded = function(params) {
	var view = params.view;
	
	if(view.cacheTimeout > 0) {		
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
};

/*
 * Return a view of the page.
 */
ViewManager.prototype.getView = function(params) {
	logger.debug("getView: IN");

	var cachedView				= "";
	var reloadView				= params.request.query.reloadView || false;
	//var renderCachedView	= false;
	var renderNewView			= false;


	//var viewData					= null;
	var viewName					= params.viewName;
	var view							= this.views[viewName];
	var viewConfig				= view.getViewConfig();
	var viewPrettyPrint		= false;
	var THIS							= this;
	//view = params.view || null;

	if(view === null) {
		logger.error("getView: this.view === null");
	}
	delete params.view;

	viewPrettyPrint = params.request.query.viewPrettyPrint || "false";
	
	if(reloadView) {
		
		this._loadSource(viewConfig);
		renderNewView = true;
	}
	
	if(this._isNewCacheViewNeeded({ view : view })) {
		renderNewView = true;
	}
	
	//viewName				= view.getViewName();
	return new Promise(function(resolve, reject) {
		logger.debug("getView: renderNewView:" + renderNewView);

		if(!renderNewView) {
			logger.debug("getView: rendering cached view");
			cachedView = view.cachedView;
			if(viewPrettyPrint === "true") {
				cachedView = html.prettyPrint(cachedView, {indent_size: 2});
			}
			resolve(cachedView);	
			return;
		}
		
		// render a new view.
		view
			.getModel(params)
			.then(function(viewParams) {
				return(THIS._getDustRender({
						//viewName	: viewName,
						viewName	: view.getViewName(),
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
};

var viewManager = new ViewManager();

module.exports = viewManager;