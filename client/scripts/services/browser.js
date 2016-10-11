var userAgent = window.navigator.userAgent.toLowerCase(),
    isInitiallyMobile = userAgent.indexOf('mobile') > -1 || userAgent.indexOf('android') > -1,
    mobile = isInitiallyMobile,
    browser = {};

function isMobile() {
  return isInitiallyMobile ? true : mobile;
}

function isIOS() {
  return ['iPad', 'iPhone'].indexOf(navigator.platform) >= 0 || false;
}

function getSize() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  }
}

function isChrome() {
  return (/chrom(e|ium)/.test(navigator.userAgent.toLowerCase()));
}

function getUrlParams(param) {
  var theParam = window.location.search.substr(1).split('&');

  for (var i = 0; i < theParam.length; i++) {
    var p = theParam[i].split('=');
    if (p[0] == param) {
      return decodeURIComponent(p[1]);
    }
  }
  return false;
}

/////////////////

browser.getSize = getSize;
browser.isMobile = isMobile;
browser.isIOS = isIOS;
browser.isChrome = isChrome;
browser.getUrlParams = getUrlParams;

module.exports = browser;