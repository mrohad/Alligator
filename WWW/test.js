(function(lib,application,request,responseHead,writeEscapedText,forward,sendRedirect,write,session) {writeEscapedText("%3CHTML%3E%0A");
writeEscapedText("%09%09%3Chead%3E%3Ctitle%3EAlligatro%20test%3C/title%3E%3C/head%3E%0A");
writeEscapedText("%09%3CBODY%3E%0A");
writeEscapedText("%09%09");	if(request.parameters.night != undefined && request.parameters.night=="1"){
writeEscapedText("%09%09%09Good%20night%21%20%0A");
writeEscapedText("%09%09");}else{
writeEscapedText("%09%09%09Hello%20World%21%0A");
writeEscapedText("%09%09");}
writeEscapedText("%09%0A");
writeEscapedText("%09%3Cbr/%3E%0A");
writeEscapedText("%09%3C/BODY%3E%0A");
writeEscapedText("%3C/HTML%3E%0A");
})