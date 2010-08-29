var memcache = require('./mc/memcache'),
asemaphore = require('./asemaphore'),
log = require('./log');


var applicationScope = function(webAppName,mcOptions){
	this.webAppName = webAppName.replace(" ","");
	this.mcOptions = mcOptions;
};

applicationScope.prototype.get = function(seprator,key,cb){
	if(this.mcOptions.enable){
		var connection = new Memcache(this.mcOptions.server, this.mcOptions.port);
		log.debug("Application","connectin memcache for get key("+seprator+this.webAppName+key+")");
		connection.get(seprator+this.webAppName+key, function(response) {
			log.debug("Application","Memecahe GET results("+response.success+") - "+response.data);
			if (cb){
				if(response.success)
					try{
						
						cb(JSON.parse(response.data));
					}
					catch(err){
						cb(undefined);
					}
				else
					cb(undefined);
			}
		}); 
	}else
		if (cb)	cb(this[seprator+this.webAppName+key]);	
};

applicationScope.prototype.set = function(seprator,key,value,cb){
	if(this.mcOptions.enable){
		var connection = new Memcache(this.mcOptions.server, this.mcOptions.port);
		log.debug("Application","connectin memcache for get key("+seprator+this.webAppName+key+")");
		connection.set(seprator+this.webAppName+key, JSON.stringify(value), {expires:0,flags:0,callback: function () {
			if (cb)	cb();
		}});
	}else{
		this[seprator+this.webAppName+key] = value;
		if (cb)	cb();
	}
};

applicationScope.prototype.remove = function(seprator,key,cb){
	if(this.mcOptions.enable){
		var connection = new Memcache(this.mcOptions.server, this.mcOptions.port);
		log.debug("Application","connectin memcache for get "+this.mcOptions.server+" " +this.mcOptions.port);
		connection.del(seprator+this.webAppName+key, {callback: function () {
			if (cb)	cb();
		}});
	}else
		this[seprator+this.webAppName+key] = undefined;
	if (cb)	cb();
};

var instance = undefined;
exports.start = function(webAppName,mcOptions){
	log.info("Application","Starting application scope for "+webAppName+" memcahecOptions - "+mcOptions);
	if(instance == undefined)
		instance = new applicationScope(webAppName,mcOptions);
	return instance;	
};

var manager = function(seprator,currentAsemaphore){
	this.seprator = seprator;
	this.currentAsemaphore = currentAsemaphore;
};

manager.prototype.get = function(key,cb){
	if(instance==undefined)
		throw "You have to call start() first";
	if(cb!=undefined)	
		instance.get(this.seprator, key, this.currentAsemaphore.warpCallBack(cb));
	else
		instance.get(this.seprator, key, undefined);
};

manager.prototype.set = function(key,value,cb){
	if(instance==undefined)
		throw "You have to call start() first";
	if(cb!=undefined)
		instance.set(this.seprator, key, value, this.currentAsemaphore.warpCallBack(cb));
	else
		instance.set(this.seprator, key, value, undefined);
};

manager.prototype.remove = function(key,cb){
	if(instance==undefined)
		throw "You have to call start() first";
	if(cb!=undefined)
		instance.remove(this.seprator, key, this.currentAsemaphore.warpCallBack(cb));
	else
		instance.remove(this.seprator, key, undefined);
};

exports.getManager = function(seprator,currentAsemaphore){
	return new manager(seprator,currentAsemaphore);
};