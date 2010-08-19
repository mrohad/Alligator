var EventEmitter = require('events').EventEmitter,
    http = require('http'),
    fs = require('fs'),
    mime = require('./content-type'),
    pathlib = require('path'),
    uri = require('url'),
    log = require('./log'),
    sys = require('sys'),
    Script = process.binding('evals').Script,
    utils = require('./utils'),
    sessionManager = require('./session'),
    incomingForm = require('./incoming_form').incomingForm,
    multi = require('./multinode/multi-node'),
    asemaphore = require('./asemaphore'),
    applicationManager = require('./application');	

var cachedJssp = [];
var lib = new Object();
var globalSettings;
var applicationScope;
var sessionScope;

exports.start = function(settings) {
	globalSettings = defaultSettings(settings);
	if(globalSettings.debug_mode)
		log.level = log.levels.DEBUG;
	else
		log.level = log.levels.WARN;
	log.info("Starting Web App - " +globalSettings.web_app_name);	
	//setting up sessionScope and applicationScope:
	applicationScope = applicationManager.start(globalSettings.web_app_name,globalSettings.server_script.memcached);
	sessionScope = sessionManager.start(globalSettings.server_script.session_minutes,globalSettings.web_app_name);
	
	//Load utils dynamicly 
	if(globalSettings.path.lib != undefined)
		fs.stat(globalSettings.path.lib, function (err, stats) {
			if (err) 
				log.error("Loading lib error:"+err);
			else if(!stats.isDirectory()) 
				log.error("Loading lib error: path must be a directory");
			else{
				var files = fs.readdirSync(globalSettings.path.lib);	
				for(i=0;i<files.length;i++){
					var file = files[i];
					if(files[i].endsWith(".js")){
						var fileNoJs =  file.substring(0,files[i].length-3);
						var path = pathlib.join(globalSettings.path.lib,fileNoJs);
						eval("lib."+fileNoJs+" = require(path)");
						log.info("Loading lib file:" + path);
					}
				}	
			}
		});
	//END util loading
	var server = http.createServer(function (req, res) {
		log.debug("request arrived!");
		var url = uri.parse(req.url,true);
		var pathname = (url.pathname || '/');
		var cleanPathname = pathname
			.replace(/\.\.\//g,'') //disallow parent directory access
			.replace(/\%20/g,' '); //convert spaces
		if(req.method == "GET"){
			var params = url.query;
			if(params == undefined)
				params = new Object();
			req.parameters = params;
			handleRequest(req,res,cleanPathname);			
		}
		else if (req.method == "POST"){
			incomingForm.parse(req, function(err, fields, files) {
				//log.debug("POST fields:" + utils.arrayToString(fields));
				params = new Object();
				req.parameters = fields;
				handleRequest(req,res,cleanPathname);
			});
		}
		else //Other Methods
			handleRequest(req,res,cleanPathname);
		
				
	});
	multi.listen({
        		port: globalSettings.port, 
        		nodes: globalSettings.nodes
   		}, server);

	console.log('Server running at port '+globalSettings.port);
};

function handleRequest(req,res,cleanPathname,newSessionId){
		var root = globalSettings.path.root;
		var path = pathlib.join(root, cleanPathname);
		log.info("Handling request to: " +path + " pid("+process.pid+")");
		//log.debug("Request headers: "+utils.arrayToString(req.headers));
		fs.stat(path, function (err, stats) {
			if (err) {
			    // ENOENT is normal on 'file not found'
			    if (err.errno != process.ENOENT) { 
				// any other error is abnormal - log it
				log.error("fs.stat(",path,") failed: ", err);
			    }
			    return fileNotFound(req,res,path);
			}
			if (!stats.isFile()) 
			    return fileNotFound(req,res,path);
			else{
				if (stats.isDirectory()) 
					path.join(path, "index.html");
				var cookie = req.headers["cookie"];
				var sessionId = utils.getSessionId(cookie);
				if(newSessionId!=undefined)//forward
					sessionId = newSessionId;
				else{
					sessionScope.hello(sessionId);
				}
				if(!path.endsWith("."+globalSettings.server_script.ext)){
					sendHeaders(req, res,undefined, stats.size, mime.mimeType(path), stats.mtime); 
					var readStream = fs.createReadStream(path);
					sys.pump(readStream,res);					
				}else{

					if(cachedJssp[path] == undefined || cachedJssp[path+"#date"] != stats.mtime.toUTCString()){
						if(cachedJssp[path] != undefined)
							log.debug("CacheDate = "+cachedJssp[path+"#date"] +" REAL DATE = "+stats.mtime.toUTCString());
						var readStream = fs.createReadStream(path);
						var script = [];
						readStream.addListener("data", function (chunk) {	
							script.push(chunk.toString());	
						});
						readStream.addListener("end", function () {
							log.info("STARTING PROCESSING JSSP");		
							var forward = serverSideProcessing(script.join(""),req,res,path,stats.mtime,sessionId);
							log.info("END OF JSSP PROCESSING");		
						});
						req.connection.addListener('timeout', function() {
						    /* dont destroy it when the fd's already closed */
						    if (readStream.readable) {
							log.debug('timed out. destroying file read stream');
							readStream.destroy();
						    }
						});

						readStream.addListener('fd', function(fd) {
						    log.debug("opened",path,"on fd",fd);
						});

						readStream.addListener('error', function (err) {
						    log.error('error reading',file,sys.inspect(err));
						    resp.end('');
						});
						res.addListener('error', function (err) {
						    log.error('error writing',file,sys.inspect(err));
						    readStream.destroy();
						});
					}
					else{
						log.info("RUN JSSP FROM CACHE");
						serverSideRunning(cachedJssp[path],req,res,path,stats.mtime,sessionId);
					}
					
				}

			}		
		
		});
};

function serverSideRunning(newfileName,request,response,file,lastMod,sessionId){
	var responseHead= new Object();	
	var result = new Object();
	result.html = "";
	var flushResponse = true;
	var flushFunction = undefined;
	var error = false;
	responseHead.status = 200;
	responseHead.headers = {};
	var afterEval = [];
	var currentAsemaphore = asemaphore.ctor(1,function(){
		if(!error)
			result.html = afterEval.join("");
		if(flushResponse){//otherwise, forwarding...
			sendHeaders(request,response,responseHead,result.html.length,mime.mimeType(file,"text/html"),lastMod,result.sessionId); 
			response.end(result.html);
		}
		else if(flushFunction)
			flashFunction();
	});
	var commands = {
		write : function(text){
			//log.debug("WRITE afterEval : "+ afterEval);
			afterEval.push(text);
		},
	   writeEscapedText :function(text){
			afterEval.push(unescape(text));
		},
		forward :function(resource){
			flushFunction = handleRequest(request,response,resource,result.sessionId);
			flushResponse = false;
		},
		sendRedirect:function(url){
			responseHead.status = 301;
			responseHead.headers["location"] = url;
		}
	};
	//Waiting for a bug fix(V8)
	/*try{
		
		var script = require(newfileName);
		script.run(lib,application,request,responseHead,writeEscapedText,forward,sendRedirect,write,session);
		result.html = afterEval.join("");
		log.debug("ServerSide result:"+utils.arrayToString(result));
	}
	catch(er){
		log.warn("parse problem:"+err);
		responseHead.status = 500;
		result.html = "<h1>"+globalSettings.web_app_name+" - SERVER ERROR</h1>";
		if(globalSettings.debug_mode){
			result.html += "(Debug Mode) Could not parse jssp<br/> ";
			var erStr = "Details: ";
			result.html += erStr+er.stack;
		}
		else
			result.html += "Could not parse jssp";
	}
	if(allGood){//otherwise, we are probably forwarding...
		var ctHTML = "text/html";
		sendHeaders(request,response,responseHead,result.html.length,mime.mimeType(file,ctHTML),lastMod,result.sessionId); 
		response.end(result.html);
	}*/
	var runningFunc = function (errRead, data) {
		try{
			if (errRead) throw errRead;
			//Handling session and application with asemphore
			result.sessionId = sessionId;
			var application = applicationManager.getManager("",currentAsemaphore);
			var session = sessionManager.getManager(sessionId,currentAsemaphore,applicationManager,result);
			//-----------
			command = ["functoRun = ",data.toString()].join("");
			eval(command);
			functoRun(log,lib,application,request,responseHead,commands,session);
			currentAsemaphore.p();
			//log.debug("sessionId - "+result.sessionId);
		}catch(err){
			log.warn("parse problem:"+err);
			flushResponse = true;
			error = true;
			responseHead.status = 500;
			result.html = ["<h1>",globalSettings.web_app_name," - SERVER ERROR</h1>."].join("");
			if(globalSettings.debug_mode){
				result.html += "(Debug Mode) Could not parse jssp<br/> ";
				var erStr = "Details: ";
				result.html += erStr+err.stack;
			}
			else
				result.html += "Could not parse jssp";
			while(currentAsemaphore.p()>0);
		}
	};
	fs.readFile([newfileName,".js"].join(""),runningFunc);
}

function serverSideProcessing(str,request,response,file,lastMod,sessionId){
	var toEvalArray = [];
	var startTag = globalSettings.server_script.begin;
	var startWriteAddition = globalSettings.server_script.begin_additional_write;
	var endTag = globalSettings.server_script.end;
	var lineArray = str.split(new RegExp( "\\n", "g" ));
	var isInScript = false;
	var currentScript =[];
	var nextLine = "\n";
	for(index=0;index<lineArray.length;index++){
		line = lineArray[index];			
		while(line.length>0){
			if(!isInScript){
				var startTagIndex = line.indexOf(startTag);
				if(line.indexOf(startTag)==-1){
					toEvalArray.push('commands.writeEscapedText("'+escape(line+nextLine)+'");'+nextLine);
					line="";
				}
				else{
					lineBeforeStart = line.substring(0,startTagIndex);
					toEvalArray.push('commands.writeEscapedText("'+escape(lineBeforeStart)+'");');
					line = line.substring(startTagIndex+startTag.length);
					if(line.length==0)
						toEvalArray.push(nextLine);
					isInScript = true;
				}
			}
			else{//Inscript
				var endTagIndex =line.indexOf(endTag);
				if(line.indexOf(endTag)==-1){
					currentScript.push(line+nextLine);
					line="";
				}
				else{
					lineBeforeEnd = line.substring(0,endTagIndex);
					currentScript.push(lineBeforeEnd);
					var theScript = currentScript.join("");
					if(theScript.startsWith(startWriteAddition)) //handling <?=...?> cases
						theScript = "commands.write("+theScript.substring(startWriteAddition.length)+");";
					toEvalArray.push(theScript);
					currentScript = [];
					line = line.substring(endTagIndex+endTag.length);
					if(line.length==0)
						toEvalArray.push(nextLine);
					
					isInScript = false;
				}
			}
		}
	}
	
	var toEval =toEvalArray.join("");
	//Waiting for a bug fix(V8)
	//http://groups.google.com/group/nodejs/browse_thread/thread/7a2e409ec970198e/d9336b7b2764f129?lnk=gst&q=require+exception#d9336b7b2764f129
	//var finalFunction = "exports.run = (function(lib,application,request,responseHead,writeEscapedText,forward,sendRedirect,write,session) {"
	//		+toEval+"})";
	var finalFunction = "(function(log,lib,application,request,responseHead,commands,session) {"+toEval+"})";
	var newfileName = file.substring(0,file.length-globalSettings.server_script.ext.length-1);
	fs.writeFile(newfileName+".js", finalFunction, function (err) {
		//log.debug("Error writin cache file: "+err); 
		cachedJssp[file] = newfileName;
		cachedJssp[file + "#date"] = lastMod.toUTCString();
		log.info("Caching  - "+file + ",last mod - "+ lastMod.toUTCString());
		serverSideRunning(newfileName,request,response,file,lastMod,sessionId);
	});

}

function sendHeaders(req, res,responseHead, length, content_type, modified_time,sessionId) {
	//log.debug("send headers: sessionId - "+sessionId);
	if(responseHead==undefined)
		responseHead = new Object();
	if(responseHead.status==undefined)
		responseHead.status = 200;
	if(responseHead.headers==undefined)	
		responseHead.headers = {};
	responseHead.headers["date"] = (new Date()).toUTCString();
	responseHead.headers["Server"] = "Alligator/0.3+ Node.js/"+process.version;
	if(sessionId != undefined)
		if(responseHead.headers["Set-cookie"] == undefined)//TODO add expiary and domain
			responseHead.headers["Set-cookie"] = "njssession="+sessionId;
		else
			responseHead.headers["Set-cookie"] += ";njssession="+sessionId;
	if (length) 
		responseHead.headers["Content-Length"] = length;
	if (content_type) 
		responseHead.headers["Content-Type"] = content_type || "application/octet-stream";
	if (modified_time) 
		responseHead.headers["Last-Modified"] = modified_time.toUTCString(); 
	//log.debug("RESPONSE Headers :"+utils.arrayToString(responseHead.headers)+" +++  RESPONSE Status :"+responseHead.status);
	res.writeHead(responseHead.status, responseHead.headers);
	log.info(req.connection.remoteAddress,req.method,responseHead.status,length);
}

function fileNotFound(req,res,path) {
	log.debug("404 opening path: '"+path+"'");
	var body = "404: " + req.url + " not found.\n";
	var responseHead= new Object();
	responseHead.status = 404;
	sendHeaders(req, res,responseHead,body.length,"text/plain");
	if (req.method != 'HEAD') 
	    res.end(body, 'utf-8');
	else 
	    res.end('');
}

function defaultSettings(settings){
	if(settings.web_app_name == undefined)
		settings.web_app_name = "AlligatorWebApp ";
	if(settings.port == undefined)
		settings.port = 80;
	if(settings.path == undefined)
		settings.path = new Object();
	if(settings.path.root == undefined)
		settings.path.root = "WWW";	
	if(settings.server_script == undefined)
		settings.server_script = new Object();
	if(settings.server_script.ext == undefined)
		settings.server_script.ext = "jssp";
	if(settings.server_script.begin == undefined)
		settings.server_script.begin = "<?";
	if(settings.server_script.end == undefined)
		settings.server_script.end = "?>";
	if(settings.server_script.begin_additional_write == undefined)
		settings.server_script.begin_additional_write = "=";
	//memcached
	if(settings.server_script.memcached == undefined)
		settings.server_script.memcached = new Object();
	if(settings.server_script.memcached.enable == undefined)
		settings.server_script.memcached.enable = 0;
	if(settings.server_script.memcached.server == undefined)
		settings.server_script.memcached.server = "localhost";
	if(settings.server_script.memcached.port == undefined)
		settings.server_script.memcached.port = 11211;

	if(settings.debug_mode == undefined)
		settings.debug_mode = 1;
	if(settings.nodes == undefined)
		settings.nodes = 1;
	return settings;
}

