String.prototype.endsWith = function(str){
    var lastIndex = this.lastIndexOf(str);
    return (lastIndex != -1) && (lastIndex + str.length == this.length);
};

String.prototype.startsWith = function(str){
    return (this.indexOf(str) === 0);
};

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
};


exports.arrayToString = function(arr){
	var output = "";
	for (property in arr)
		output += property + ': ' + arr[property]+'; ';
	return output;
};

exports.getSessionId = function(cookieHeader){
	if(cookieHeader == undefined)
		return undefined;	
	var start = cookieHeader.indexOf("njssession");
	if(start == -1)
		return undefined;
	else{
		current = cookieHeader.substring(start);
		current = current.split("=")[1];
		return current.split(";")[0];
	}
};
