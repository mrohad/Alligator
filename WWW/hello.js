(function(log,lib,application,request,responseHead,commands,session) {commands.writeEscapedText("%3CHTML%3E%0A");
commands.writeEscapedText("%09%09");commands.write("<head><title>nodeJS and antiNode+</title></head>");
commands.writeEscapedText("%09%3CBODY%3E%0A");
commands.writeEscapedText("%09%09HELLO%20WORLD%3Cbr/%3E%0A");
commands.writeEscapedText("%09%09%3Cbr/%3Erequest.parameters.night%3A%20");commands.write(request.parameters.night);commands.writeEscapedText("%3C/br%3E%0A");
commands.writeEscapedText("%09%09");	if(request.parameters.night != undefined && request.parameters.night=="1"){
		
commands.writeEscapedText("%09%09Good%20night%21%20%0A");
commands.writeEscapedText("%09%09");}else{
commands.writeEscapedText("%09%09Good%20Day%21%0A");
commands.writeEscapedText("%09%09");}
commands.writeEscapedText("%09%09%3Cbr/%3E%0A");
commands.writeEscapedText("%09%09");for (index=0;index<5;index++){ commands.write(index);commands.writeEscapedText("%3B"); }
commands.writeEscapedText("%09%09%3Cbr/%3E%0A");
commands.writeEscapedText("%09%09Testing%20the%20lib%3A%09%09%3Cbr/%3E%0A");
commands.writeEscapedText("%09%09Request%20headers%3A%20");commands.write(lib.test.arrayToString(request.headers));commands.writeEscapedText("%3C/br%3E%0A");
commands.writeEscapedText("%09%09%3Cbr/%3E%0A");
commands.writeEscapedText("%09%3C/BODY%3E%0A");
commands.writeEscapedText("%3C/HTML%3E%0A");
})