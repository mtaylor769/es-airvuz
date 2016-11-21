// IMPORT: BEGIN
var log4js = require('log4js');
var logger = log4js.getLogger('app.views.view.baseView');
var _ = require('lodash');

try {
  if (global.NODE_ENV === "production") {
    logger.setLevel("WARN");
  }

  logger.info("import complete");
}
catch (exception) {
  logger.error(" import error:" + exception);
}
// IMPORT: END

var BaseView = function (params) {
  logger.error(params);
  params = params || {};
  this.viewConfig = params;
  this.model = null;
  this.cacheTimeout = this.viewConfig.cacheTimeout || -1;
  this.lastRenderViewTime = -1;
  this.cachedView = '';
};

BaseView.prototype.getViewConfig = function () {
  return this.viewConfig;
};

BaseView.prototype.getModel = function (params) {
  return this.model.getData(params)
    .bind(this)
    .then(this._mergeDefaultData);
};

BaseView.prototype._mergeDefaultData = function (data) {
  data.data = _.extend(data.data, this.model.data);
  return data;
};

BaseView.prototype.getViewName = function () {
  return this.viewConfig.viewName;
};

module.exports = BaseView;