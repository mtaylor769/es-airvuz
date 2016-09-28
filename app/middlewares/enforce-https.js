module.exports = function enforceHTTPS(req, res, next) {
  var isHttps = req.secure;

  if (isHttps || global.IS_DEVELOPMENT) {
    return next();
  }

  return res.redirect(301, 'https://' + req.hostname + req.originalUrl);
};