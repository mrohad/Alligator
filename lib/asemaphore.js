//Async semaphore
var log = require('./log');

function asemaphore(counter,fireFunc){
	this.counter = (counter==undefined?0:counter);
	this.fire = fireFunc;
	log.debug("Starting Asemaphore with counter:" +this.counter);
	
	
	this.v = function(){
		++this.counter;
		log.debug("Asemaphore counter after v(): " +this.counter);
		return this.counter;
	};
	
	this.p = function(){
		if((--this.counter)<1){
			log.debug("Asemaphore fire() after p()");
			this.fire();
		}
		//log.debug("Asemaphore counter after p(): " +this.counter);
		return this.counter;
	};
	

}

exports.ctor = function(counter,fireFunc){
	return new asemaphore(counter,fireFunc);
};

exports.warpCallBack = function(asemaphore,cb){
	if(cb == undefined)
		return undefined;
	else{
		asemaphore.v();
		return function(){
			cb.apply(this, Array.prototype.slice.call(arguments, 0));
			asemaphore.p();
		};
	}
};