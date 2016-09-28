module.exports = function forcePreferredDomain(req, res, next) {
  var host = req.hostname;

  // force to preferred domain if don't have subdomain www
  if (global.IS_PRODUCTION && host.indexOf('www.') === -1) {
    return res.redirect(301, 'https://www.' + host + req.originalUrl);
  }

  return next();
};