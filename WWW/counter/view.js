(function(log,lib,application,request,responseHead,commands,session) {commands.writeEscapedText("%3CHTML%3E%0A");
commands.writeEscapedText("%09%3CHEAD%3E%3CTITLE%3EApplication%20Scope%20Counter%20Tester%3C/TITLE%3E%3C/HEAD%3E%0A");
commands.writeEscapedText("%09%3CBODY%3E%0A");
commands.writeEscapedText("%09");
		var counter = request.parameters.counter;
		if(counter==1)
			commands.write("First Time");
		else
			commands.write("Number of users:" + counter);
			
	
commands.writeEscapedText("%09%3C/BODY%3E%0A");
commands.writeEscapedText("%3C/HTML%3E%0A");
})