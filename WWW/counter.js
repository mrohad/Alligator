(function(log,lib,application,request,responseHead,commands,session) {commands.writeEscapedText("%3CHTML%3E%0A");
commands.writeEscapedText("%09%09");commands.write("<head><title>Application Scope Counter Tester</title></head>");
commands.writeEscapedText("%09%3CBODY%3E%0A");
commands.writeEscapedText("%09%09");
			var counter = 1;
			application.get("counter",function(value){
				log.debug("COUNTER.JSSP, value - " +value);
				if(value == undefined){
					application.set("counter",1);
		
commands.writeEscapedText("%09%09First%20Time%3B%0A");
commands.writeEscapedText("%09%09%09%09%09%0A");
commands.writeEscapedText("%09%09%09%09");}else{
					counter = value+1;
					application.set("counter",counter);
		
commands.writeEscapedText("%09%09%0A");
commands.writeEscapedText("%09%09Number%20of%20users%20%3A%20");commands.write(counter);
commands.writeEscapedText("%09%09%09%09%0A");
commands.writeEscapedText("%09%09");}
commands.writeEscapedText("%09%09%0A");
commands.writeEscapedText("%09%09%3C/BODY%3E%0A");
commands.writeEscapedText("%3C/HTML%3E%0A");
commands.writeEscapedText("%09%09%09%09%09%0A");
commands.writeEscapedText("%09%09%09%09%0A");
commands.writeEscapedText("%09%09%09");});				
		
})