var memcache = require('./mc/memcache'),
asemaphore = require('./asemaphore'),
log = require('./log');


function applicationScope(webAppName,mcOptions){
	this.webAppName = webAppName.replace(" ","");
	this.mcOptions = mcOptions;
	
	this.get = function(seprator,key,cb){
		if(this.mcOptions.enable){
			var connection = new Memcache(this.mcOptions.server, this.mcOptions.port);
			log.debug("connectin memcache for get key("+seprator+this.webAppName+key+")");
			connection.get(seprator+this.webAppName+key, function(response) {
				log.debug("Memecahe GET results("+response.success+") - "+response.data);
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

	this.set = function(seprator,key,value,cb){
		if(this.mcOptions.enable){
			var connection = new Memcache(this.mcOptions.server, this.mcOptions.port);
			log.debug("connectin memcache for get key("+seprator+this.webAppName+key+")");
			connection.set(seprator+this.webAppName+key, JSON.stringify(value), {expires:0,flags:0,callback: function () {
				if (cb)	cb();
			}});
		}else{
			this[seprator+this.webAppName+key] = value;
			if (cb)	cb();
		}
	};

	this.remove = function(seprator,key,cb){
		if(this.mcOptions.enable){
			var connection = new Memcache(this.mcOptions.server, this.mcOptions.port);
			log.debug("connectin memcache for get "+this.mcOptions.server+" " +this.mcOptions.port);
			connection.del(seprator+this.webAppName+key, {callback: function () {
				if (cb)	cb();
			}});
		}else
			this[seprator+this.webAppName+key] = undefined;
		if (cb)	cb();
	};
}

var instance = undefined;
exports.start = function(webAppName,mcOptions){
	log.info("Starting application scope for "+webAppName+" memcahecOptions - "+mcOptions);
	if(instance == undefined)
		instance = new applicationScope(webAppName,mcOptions);
	return instance;	
};

function warpCallBackWithAsemaphore(cb,asemaphore){
	if(!cb)
		return undefined;
	else{
		asemaphore.v();
		return function(){
			asemaphore.p();
			cb.apply(this, Array.prototype.slice.call(arguments, 0));
		};
	}
}
exports.getManager = function(seprator,currentAsemaphore){
	return {
		get : function(key,cb){
			if(instance==undefined)
				throw "You have to call start() first";
			if(cb!=undefined)	
				instance.get(seprator, key, asemaphore.warpCallBack(currentAsemaphore,cb));
			else
				instance.get(seprator, key, undefined);
		},
		
		set : function(key,value,cb){
			if(instance==undefined)
				throw "You have to call start() first";
			if(cb!=undefined)
				instance.set(seprator, key, value, asemaphore.warpCallBack(currentAsemaphore,cb));
			else
				instance.set(seprator, key, value, undefined);
		},
		
		remove : function(key,cb){
			if(instance==undefined)
				throw "You have to call start() first";
			if(cb!=undefined)
				instance.remove(seprator, key, asemaphore.warpCallBack(currentAsemaphore,cb));
			else
				instance.remove(seprator, key, undefined);
		}
	};
};