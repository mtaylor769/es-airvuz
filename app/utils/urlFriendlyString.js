function urlFriendlyString() {}

function createUrl(urlString) {
    //move characters to lowercase
    var urlLowerCase = urlString.toLowerCase();
    //remove special characters and squash spaces
    var urlRemoveSpecialCharacters = urlLowerCase.replace(/[^a-zA-Z ]/g, "");
    //replace all spaces with "-"
    var urlAddDash = urlRemoveSpecialCharacters.replace(/[^A-Z0-9]+/ig, "-");
    return urlAddDash;
}

urlFriendlyString.prototype.createUrl = createUrl;

module.exports = new urlFriendlyString();