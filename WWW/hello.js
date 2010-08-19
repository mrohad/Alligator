(function(log,lib,application,request,responseHead,writeEscapedText,forward,sendRedirect,write,session) {writeEscapedText("%3CHTML%3E%0A");
writeEscapedText("%09%09");write("<head><title>nodeJS and antiNode+</title></head>");
writeEscapedText("%09%3CBODY%3E%0A");
writeEscapedText("%09%09");
			var counter = 1;
			application.get("counter",function(value){
				log.debug("HELLO.JSSP, value - " +value);
				if(value == undefined)	
					application.set("counter",1);
				else{
					counter = value+1;
					application.set("counter",counter);			
				}
			});				
		
writeEscapedText("%09%09HELLO%20WORLD%3Cbr/%3E%0A");
writeEscapedText("%09%09Number%20of%20users%3A%0A");
writeEscapedText("%09%09"); 
			write(counter+"<br/>");	
		
writeEscapedText("%09%09%09%3Cbr/%3Erequest.parameters.night%3A%20");write(request.parameters.night);writeEscapedText("%3C/br%3E%0A");
writeEscapedText("%09%09");	if(request.parameters.night != undefined && request.parameters.night=="1"){
		
writeEscapedText("%09%09Good%20night%21%20%0A");
writeEscapedText("%09%09");}else{
writeEscapedText("%09%09Good%20Day%21%0A");
writeEscapedText("%09%09");}
writeEscapedText("%09%09%3Cbr/%3E%0A");
writeEscapedText("%09%09");for (index=0;index<5;index++){ write(index);writeEscapedText("%3B"); }
writeEscapedText("%09%09%3Cbr/%3E%0A");
writeEscapedText("%09%09Testing%20the%20lib%3A%09%09%3Cbr/%3E%0A");
writeEscapedText("%09%09Request%20headers%3A%20");write(lib.test.arrayToString(request.headers));writeEscapedText("%3C/br%3E%0A");
writeEscapedText("%09%09%3Cbr/%3E%0A");
writeEscapedText("%09%09Setting%20a%20cookie%20a%3Db%20using%3A%20responseHead.headers%5B%22Set-cookie%22%5D%20%3D%20%22a%3Db%22%3B%3Cbr/%3E%0A");
writeEscapedText("%09%09");responseHead.headers["Set-cookie"] = "a=b";
writeEscapedText("%09%3C/BODY%3E%0A");
writeEscapedText("%3C/HTML%3E%0A");
})