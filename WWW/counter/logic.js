(function(log,lib,application,request,responseHead,commands,session) {commands.writeEscapedText("");
	var counter = 1;
	application.get("counter",function(value){
		log.debug("COUNTER.JSSP, value - " +value);
		if(value == undefined){
			application.set("counter",1);
		}else{
			counter = value+1;
			application.set("counter",counter);
		}
		request.parameters.counter = counter;
		commands.forward("counter/view.jssp");				
	});				

})