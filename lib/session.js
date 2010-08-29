var asemaphore = require('./asemaphore'),
log = require('./log');

function createUUID() {
    var hexDigits = "0123456789ABCDEF";
    var s = [];
    for (var i = 0; i < 32; i++) 
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    s[12] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    var uuid = s.join("");
    return uuid;
}


var sessionScope = function(sessionTimeOutMinutes,webAppName){
	this.webAppName = webAppName;
	this.timers = new Object();
	this.numberOfMin = (sessionTimeOutMinutes==undefined?30:sessionTimeOutMinutes);//default 30 min
	this.numberOfMili = this.numberOfMin*60*1000;
	log.info("Session","Session has been created, session timeout = "+this.numberOfMin+" minutes");
	this.latestApllication = undefined;
};

sessionScope.prototype.hello = function(uid){
	log.debug("Session","sessionManger.hello: uid - " + uid);
	if(uid != undefined ){
		if(this.timers[this.webAppName+uid] != undefined)
			clearTimeout(this.timers[this.webAppName+uid]);
		this.timers[this.webAppName+uid] = this.setSessionTimeout(this.latestApllication,uid);
	}
};

sessionScope.prototype.setSessionTimeout = function(application,uid){//adding *minutes* to the uid timeout
	log.debug("Session","session.setSessionTimeout: uid - " + uid + " app - " + application);
	var sessionObj = this;
	return setTimeout((function(application,uid){
		if(uid!=undefined && application!=undefined){
			sessionObj.remove(application,uid);
			sessionObj.timers[sessionObj.webAppName+uid] = undefined;
			log.info("Session","Clearing session: "+sessionObj.webAppName+uid);
		}
	})
	,this.numberOfMili,application,uid);
};

sessionScope.prototype.remove = function(application,uid,cb){
	application.remove(uid,cb);
};
	
sessionScope.prototype.saveObjectInSession =function(application,key,value,uid,obj,cb){
	obj[key] = value;
	application.set(uid,obj,cb);
};

sessionScope.prototype.set = function(application,key,value,uid,cb){
	log.debug("Session","sessionMap.set: key-"+key+" value-" +value+" uid-"+uid);
	this.latestApllication = application;
	var cont = true;
	if(uid==undefined){
		uid = createUUID();
		var sessionObj = this;
		application.get(uid,function(result){
			if(result!=undefined)
				this.set(application,key, value, undefined, cb);
			else{
				log.debug("Session","New session UID:"+uid);
				sessionObj.setSessionTimeout(application,uid);
				sessionObj.saveObjectInSession(application,key,value,uid,new Object(),cb);
			}
		});			
	}else{
		var saveFunc = this.saveObjectInSession;
		application.get(uid,function(result){
			if(result!=undefined)
				saveFunc(application,key,value,uid,result,cb);
			else
				saveFunc(application,key,value,uid,new Object(),cb);
		});
	}
	//log.debug("Session","sessionMap.set: return uid-"+uid);
	return uid;
};


sessionScope.prototype.get = function(application,key,uid,cb){
	log.debug("Session","sessionMap.get: key-"+key+" uid-"+uid);
	this.latestApllication = application;
	if(uid==undefined)
		cb(undefined);
	else{
		application.get(uid,function(obj){
			if(obj!=undefined){
				cb(obj[key]);
			}else
				cb(undefined);
		});
	}
};

var instance = undefined;
exports.start = function(sessionTimeOutMinutes,webAppName){
	if(instance == undefined)
		instance = new sessionScope(sessionTimeOutMinutes,webAppName);
	return instance;	
};

var manager = function(uid,currentAsemaphore,applicationManager,result){
	this.application = applicationManager.getManager("ssn-",currentAsemaphore);
	this.uid = uid;
	this.currentAsemaphore = currentAsemaphore;
	this.applicationManager = applicationManager;
	this.result = result;
};


manager.prototype.get = function(key,cb){
	if(instance==undefined)
		throw "You have to call start() first";
	if(cb!=undefined)
		instance.get(this.application,key, this.uid, this.currentAsemaphore.warpCallBack(cb));
	else
		instance.get(this.application,key, this.uid, undefined);
};

manager.prototype.set =function(key,value,cb){
	if(instance==undefined)
		throw "You have to call start() first";
	if(cb!=undefined)
		this.result.sessionId = instance.set(this.application,key, value, this.uid, this.currentAsemaphore.warpCallBack(cb));
	else
		this.result.sessionId = instance.set(this.application,key, value, this.uid, undefined);
		//log.debug("Session","sessionManager.set: result.sessionId - "+result.sessionId);
};

exports.getManager = function(uid,currentAsemaphore,applicationManager,result){
	return new manager(uid,currentAsemaphore,applicationManager,result);
};

