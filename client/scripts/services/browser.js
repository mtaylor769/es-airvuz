var userAgent = window.navigator.userAgent.toLowerCase(),
    isInitiallyMobile = userAgent.indexOf('mobile') > -1 || userAgent.indexOf('android') > -1,
    mobile = isInitiallyMobile,
    browser = {};

function isMobile() {
  return isInitiallyMobile ? true : mobile;
}

function getSize() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  }
}

/////////////////

browser.getSize = getSize;
browser.isMobile = isMobile;

module.exports = browser;