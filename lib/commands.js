var log = require('./log');

var commands = function(afterEval,request,response,result,responseHead,handleRequest,flushFunction,flushResponse){
	this.afterEval = afterEval;
	this.request = request;
	this.response = response;
	this.result = result;
	this.responseHead = responseHead;
	this.handleRequest = handleRequest;
	this.flushFunction = flushFunction;
	this.flushResponse = flushResponse;
};
	
commands.prototype.write = function(text){
	this.afterEval.push(text);
};

commands.prototype.writeEscapedText = function(text){
	this.afterEval.push(unescape(text));
};

commands.prototype.forward = function(resource){
	this.flushFunction = this.handleRequest(this.request,this.response,this.resource,this.result.sessionId);
	this.flushResponse = false;
};

commands.prototype.sendRedirect = function(url){
	this.responseHead.status = 301;
	this.responseHead.headers["location"] = url;
};

exports.getCommands = function(afterEval,request,response,result,responseHead,handleRequest,flushFunction,flushResponse){
	return new commands(afterEval,request,response,result,responseHead,handleRequest,flushFunction,flushResponse);
};