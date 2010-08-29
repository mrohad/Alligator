this.page = function (context){context.writeEscapedText("%3CHTML%3E%0A");
context.writeEscapedText("%09%3CHEAD%3E%3CTITLE%3EApplication%20Scope%20Counter%20Tester%3C/TITLE%3E%3C/HEAD%3E%0A");
context.writeEscapedText("%09%3CBODY%3E%0A");
context.writeEscapedText("%09");
		var counter = context.request.parameters.counter;
		if(counter==1)
			context.write("First Time");
		else
			context.write("Number of users:" + counter);
			
	
context.writeEscapedText("%09%3C/BODY%3E%0A");
context.writeEscapedText("%3C/HTML%3E%0A");
};