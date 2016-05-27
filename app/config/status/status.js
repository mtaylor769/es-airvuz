"use strict";

//Status Codes 1XX
var Informational = {
	STAT100 : "Continue",
	STAT101 : "Switching Protocols",
	STAT102 : "Processing"
}

//Status Codes 2XX
var Success = {
	STAT200 : "OK",
	STAT201 : "Created",
	STAT202 : "Request Accepted",
	STAT203 : "Information Returned From Non-Source",
	STAT204 : "No Content Returned",
	STAT205 : "Please Refresh Page",
	STAT206 : "Request Partially Fulfilled",
	STAT207 : "Multiple Requests Finished",
	STAT208 : "Already Submitted",
	STAT226 : "IM Used"

}

//Status Codes 3XX
var Redirection = {
	STAT300 : "Multiple Choices",
	STAT301 : "Moved Permanent",
	STAT302 : "Found",
	STAT303 : "See Other",
	STAT304 : "Not Modified",
	STAT305 : "Use Proxy",
	STAT306 : "Unused",
	STAT307 : "Temporary Redirect",
	STAT308 : "Permanent Redirect"
}

//Status Codes 4XX
var Client_Error = {
	STAT400 : "Bad Request",
	STAT401 : "Unauthorized",
	STAT402 : "Payment Required",
	STAT403 : "Forbidden",
	STAT404 : "Not Found",
	STAT405 : "Method Not Allowed",
	STAT406 : "Not Acceptable",
	STAT407 : "Proxy Authentication Required",
	STAT408 : "Request Timeout",
	STAT409 : "Conflict",
	STAT410 : "Gone",
	STAT411 : "Length Required",
	STAT412 : "Precondition Failed",
	STAT413 : "Request Entity Too Large",
	STAT414 : "Request URI Too Long",
	STAT415 : "Unsupported Media Type",
	STAT416 : "Requested Range Not Satisfiable",
	STAT417 : "Expectation Failed",
	STAT418 : "April Fools! Please enter Konami code to continue",
	STAT420 : "Enhance your calm.  See Status Code 429",
	STAT422 : "Unprocessable Entity",
	STAT423 : "Locked",
	STAT424 : "Failed Dependency.  A dependent resource has failed.",
	STAT425 : "",  //Unordered Collection
	STAT426 : "Upgrade Required",
	STAT428 : "Precondition Required",
	STAT429 : "Too Many Requests",
	STAT431 : "Request Header Fields Too Large",
	STAT444 : "No Response",
	STAT449 : "Retry", //Usually a Microsoft error
	STAT450 : "Blocked By Windows Parental Control",
	STAT451 : "Unavailable For Legal Reasons",
	STAT499 : "Client Closed Request"
}


//Status Codes 5XX
var Server_Error = {
	STAT500 : "Internal Server Error",
	STAT501 : "Not Implemented",
	STAT502 : "Bad Gateway",
	STAT503 : "Service Unavailable",
	STAT504 : "Gateway Timeout",
	STAT505 : "HTTP Version Not Supported",
	STAT506 : "Internal Configuration Error", //Known as Variant Also Negotiates
	STAT507 : "Insufficiant Storage",
	STAT508 : "Infinite Loop",
	STAT509 : "Bandwitdh Limit Exceeded",
	STAT510 : "Access Not Fully Granted",  //Also known as Not EXtended
	STAT511 : "Client Needs to Authenticate",
	STAT598 : "Network Read Timeout Error",
	STAT599 : "Network Connect Timeout Error"
}
