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
var seprator = "[ssn]";//make sure web app can't contain the char']'

function sessionScope(sessionTimeOutMinutes,webAppName){
	this.webAppName = webAppName;
	this.timers = new Object();
	this.numberOfMin = (sessionTimeOutMinutes==undefined?30:sessionTimeOutMinutes);//default 30 min
	this.numberOfMili = this.numberOfMin*60*1000;
	log.info("Session has been created, session timeout = "+this.numberOfMin+" minutes");

	this.hello = function(uid){
		if(uid != undefined && this.timers[this.webAppName+uid] != undefined){
			clearTimeout(this.timers[this.webAppName+uid]);
			this.timers[webAppName+uid] = this.setSessionTimeout(uid);
		}
	};

	this.setSessionTimeout = function(uid){//adding *minutes* to the uid timeout
		return setTimeout((function(sid){
			if(sid!=undefined){
				this.remove(sid);
				this.timers[this.webAppName+sid] = undefined;
				log.info("Clearing session: "+this.webAppName+sid);
			}
		})
		,this.numberOfMili,uid);
	};

	this.remove = function(application,nuid,cb){
		application.remove(seprator,uid,cb);
	};
		
	this.saveObjectInSession =function(application,key,value,uid,obj,cb){
		obj[key] = value;
		application.set(seprator,uid,obj,cb);
	};
	
	this.set = function(application,key,value,uid,cb){
		log.debug("sessionMap.set: key-"+key+" value-" +value+" uid-"+uid);
		var cont = true;
		if(uid==undefined){
			uid = createUUID();
			application.get(seprator,uid,function(result){
				if(result!=undefined)
					this.set(key, value, undefined, cb);
				else{
					log.debug("New session UID:"+uid);
					this.setSessionTimeout(uid);
					this.saveObjectInSession(application,key,value,uid,new Object(),cb);
				}
			});			
		}else{
			application.get(seprator,uid,function(result){
				if(result!=undefined)
					this.saveObjectInSession(application,key,value,uid,result,cb);
				else
					throw "InvalidSession";
			});
		}
	};


	this.get = function(application,key,uid,cb){
		log.debug("sessionMap.get: key-"+key+" uid-"+uid);
		if(uid==undefined)
			throw "InvalidSession";
		else{
			application.get(seprator,uid,function(result){
				if(result!=undefined)
					cb(result[key]);
				else
					throw "InvalidSession";
			});
		}
	};
}

var instance = undefined;
exports.start = function(sessionTimeOutMinutes,webAppName){
	if(instance == undefined)
		instance = new sessionScope(sessionTimeOutMinutes,webAppName);
	return instance;	
};


exports.getManager = function(uid,currentAsemaphore,application){
	return {
		get : function(key,cb){
			if(instance==undefined)
				throw "You have to call start() first";
			if(cb!=undefined)
				instance.get(application,key, uid, asemaphore.warpCallBack(currentAsemaphore,cb));
			else
				instance.get(application,key, uid, undefined);
		},
		
		set : function(key,value,cb){
			if(instance==undefined)
				throw "You have to call start() first";
			if(cb!=undefined)
				instance.set(application,key, value, uid, asemaphore.warpCallBack(currentAsemaphore,cb));
			else
				instance.set(application,key, value, uid, undefined);
		}
	};
};
