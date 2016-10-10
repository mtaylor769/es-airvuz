var namespace = 'app.routes.api.acl';
try {
    var log4js      = require('log4js');
    var logger      = log4js.getLogger(namespace);
    var acl1_0_0    = require('../../utils/acl');

    if(global.NODE_ENV === "production") {
        logger.setLevel("INFO");
    }
}
catch(exception) {
    logger.error(" import error:" + exception);
}

/**
 * returns an http 400 status along with "incorrect api version requested" to requster
 * displays remote address
 * @param req
 * @param res
 */
function incorrectVer(req, res) {
    logger.info("incorrect api version requested: " + req.query.apiVer +
        ", requester IP: " + req.connection.remoteAddress);
    res.status(400).json({error: "invalid api version"});
}


function Acl() {}
/*
 * If the request object param contains "apiVer" use its value to set version
 * and call corresponding version of video api object
 * if "apiVer" is not present, use default
 */
var defaultVer = "1.0.0";

function put (req, res) {

    var version = req.query.apiVer || defaultVer;

    if (version === "1.0.0") {
        acl1_0_0.put(req, res);
    }
    else {
        incorrectVer(req,res);
    }
}

Acl.prototype.put = put;

module.exports = new Acl();