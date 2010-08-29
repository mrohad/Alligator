this.page = function (context){context.writeEscapedText("");
	var counter = 1;
	context.application.get("counter",function(value){
		context.log.debug("ApplicationLOGIC.JSSP, value - " +value);
		if(value == undefined){
			context.application.set("counter",1);
		}else{
			counter = value+1;
			context.application.set("counter",counter);
		}
		context.request.parameters.counter = counter;
		context.forward("counter/view.jssp");				
	});					

context.writeEscapedText("");
};
	this.test = function(context){
		return "hello ajax world";
	};
