//Async Semaphore
var log = require('./log');

var ASemaphore = function(semaphore,fireFunc){
	this.semaphore = (semaphore==undefined?0:semaphore);
	this.fire = fireFunc;
	log.debug("ASemaphore","Starting Asemaphore with semaphore:" +this.semaphore);
};

ASemaphore.prototype.v = function(){
	++this.semaphore;
	log.debug("ASemaphore","Asemaphore semaphore after v(): " +this.semaphore);
	return this.semaphore;
};

ASemaphore.prototype.p = function(){
	if((--this.semaphore)<1){
		log.debug("ASemaphore","Asemaphore fire() after p()");
		this.fire.apply(this,arguments);
	}
	log.debug("ASemaphore","Asemaphore counter after p(): " +this.counter);
	return this.counter;
};

ASemaphore.prototype.warpCallBack = function(cb){
	if(cb == undefined)
		return undefined;
	else{
		var sem = this;
		sem.v();
		return function(){
			cb.apply(sem, Array.prototype.slice.call(arguments, 0));
			sem.p();
		};
	}
};

exports.ctor = function(semaphore,fireFunc){
	return new ASemaphore(semaphore,fireFunc);
};