var originWhitelist = [
  'http://localhost',
  'https://beta.airvuz.com',
  'http://beta.airvuz.com',
  'https://www.airvuz.com',
  'http://www.airvuz.com',
  'https://airvuz.com',
  'http://airvuz.com'
];

var options = {
  allowOrigin: createWhitelistValidator(originWhitelist),
  allowCredentials: true,
  shortCircuit: true,
  maxAge: 120,
  //exposeHeaders: ['X-Powered-By'],
  allowMethods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowHeaders: ['Authorization', 'X-Requested-With', 'Content-type']
  // allow all header
  //allowHeaders: function(req) {
  //	return req.headers['access-control-request-headers'];
  //}
};

function createWhitelistValidator(whitelist) {
  return function (val) {
    for (var i = 0; i < whitelist.length; i++) {
      if (val === whitelist[i]) {
        return true;
      }
    }
    return false;
  };
}

function isPreflight(req) {
  var isHttpOptions = req.method === 'OPTIONS';
  var hasOriginHeader = req.headers.origin;
  var hasRequestMethod = req.headers['access-control-request-method'];
  return isHttpOptions && hasOriginHeader && hasRequestMethod;
}

function isSameOrigin(req) {
  var host = req.protocol + '://' + req.headers.host;
  var origin = req.headers.origin;
  return host === origin || !origin;
}

module.exports = function cors(req, res, next) {
  if (options.allowOrigin) {
    var origin = req.headers.origin;
    if (options.allowOrigin(origin) || isSameOrigin(req)) {
      res.set('Access-Control-Allow-Origin', origin);
    } else if (options.shortCircuit) {
      // If origin is invalid, stops processing request and returns an HTTP 403 response.
      res.status(403).end();
      return;
    }
    res.set('Vary', 'Origin');
  } else {
    res.set('Access-Control-Allow-Origin', '*');
  }

  if (options.allowCredentials) {
    res.set('Access-Control-Allow-Credentials', 'true');
  }

  if (isPreflight(req)) {
    res.set('Access-Control-Allow-Methods', options.allowMethods.join(','));
    res.set('Access-Control-Allow-Headers', options.allowHeaders.join(','));
    if (options.maxAge) {
      res.set('Access-Control-Max-Age', options.maxAge);
    }
    res.status(204).end();
    return;
  } else if (options.exposeHeaders) {
    res.set('Access-Control-Expose-Headers', options.exposeHeaders.join(','));
  }
  next();
};