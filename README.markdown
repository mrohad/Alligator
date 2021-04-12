Alligator is a simple application server built on top of AntiNode and Node.js

Latest Version 0.37

# Usage

Run it from the command line.

    $ node alligator.js

Requires Node.JS v0.1.99 or greater.
If you want to bind to a port under 1024, you'll need to run node with special
privileges.

# Features
- Handling request parameters easily (for GET and POST)
- Distributed session management, including timeout
- Distributed application scope management
- Dynamic js loader (the lib folder)
- User can set the server-side script begin and end tags
- Utilizing all cores per cpu (the `nodes` settings parameter)

When one is writing a script nested to the <? some;JavaScript;Code;In Here;?> tags

He/She can use the following implicit functions/variables over the context object:

- `context.request` for handling the request
- `context.request.parameters` to read and write request post/get parameters
- `context.responseHead.header` to add headers of the response (e.g. responseHead.header["set-cookie"] = "..";)
- `context.responseHead.status` to change the HTTP response status
- `context.write(str)` to add string to the response body (or instead one can use the <?=str?> tag)
- `context.forward(other.jssp)` to forward the request and response to another server-side resource
- `context.sendRedirect(url)` to send HTTP redirect response back to the client
- `context.lib.filename.member` to access whatever lib one has loaded
- `context.session.set(key,value,callbackFunc)` to put anything on the HttpSession
- `context.session.get(key,callbackFunc)` to get anything from the HttpSession
- `context.application.set(key,value,callbackFunc)` to put anything on the application context
- `context.application.get(key,callbackFunc)` to get anything from the application context

#Examples
Ex1.jssp:

    <? var a = 1+1;?><br/>
    <? context.write(a);?>

Translates to:

    <br/>2

Once can achieve the same thing using Ex2.jssp

<? var a = 1+1;?><br/>
    <?=a?>

One can forward from one jssp to another:

Exf1.jssp:

    <? var dbInfo= gettingInfoFromDatabase();
       context.request.parameters.db = dbInfo;
           context.forward("showTable.jssp");?>

showTable.jssp:

    <?=genetrateHTMLTable(request.parameters.db)?>

One can easily redirect:

    <? if(request.parameters.googleIt=="true")
    	context.sendRedirect("http://www.google.com");
    else{?>
    <H1> Welcome...</H1>
    <?}?>

How to use the session scope, the counter Example: (separation of logic and view)

logic.jssp:

    <?
    	var counter = 1;
    	context.session.get("counter",function(value){
    		context.log.debug("Page","SESSIONLOGIC.JSSP, value - " +value);
    		if(value == undefined){
    			context.session.set("counter",1);
    		}else{
    			counter = value+1;
    			context.session.set("counter",counter);
    		}
    		context.request.parameters.counter = counter;
    		context.forward("counter/view.jssp");
    	});
    ?>

view.jssp:

    <HTML>
    	<HEAD><TITLE>Application Scope Counter Tester</TITLE></HEAD>
    	<BODY>
    	<?
    		var counter = request.parameters.counter;
    		if(counter==1)
    			context.write("First Time");
    		else
    			context.write("Number of hits by you:" + counter);

    	?>
    	</BODY>
    </HTML>

In case you had like to write JS only you can use a file with the 'script_ext', here is a different way to write logic.jssp

logic.ssjs: (no script tags)

    this.page = function (context){
    	var counter = 1;
    	context.application.get("counter",function(value){
    		context.log.debug("Page","ApplicationLOGIC.JSSP, value - " +value);
    		if(value == undefined){
    			context.application.set("counter",1);
    		}else{
    			counter = value+1;
    			context.application.set("counter",counter);
    		}
    		context.request.parameters.counter = counter;
    		context.forward("counter/view.jssp");
    	});
    }

**Please note that behind the scene Alligator translate JSSP file to SSJS file upon the first request to this JSSP file(lazy)
and later on use the SSJS file only.
One can develop SSJS files instead of JSSP which makes the translation unnecessary.
Alligator invokes the page() function.

One can also add content outside the page() function in two ways:
using the <?! code here ?> tag
sample.jssp:

    <?!
    	this.test = function(context){
    		context.write("hello ajax world");
    	};
    ?>
    
    <html>
    	<head>
    		<script src="jquery142.js"></script>
    		<script src="alligator.js"></script>
    		<script>
    			function click1(){
    				server("test",function(text){
    					$("#hello").html(text);
    				});
    			}
    		</script>
    	</head>
    	<body>
    		<span id="hello"></span><br/>
    		 <form>
     			<input type="button" id="button1" value="click me" onclick="click1()" />
     		</form>
    	</body>
    </html>

which compiles to sample.ssjs: (the text is escaped)

    this.page = function (context){context.writeEscapedText("");
    	context.writeEscapedText("%3Chtml%3E%0A");
    	context.writeEscapedText("%09%3Chead%3E%0A");
    	context.writeEscapedText("%09%09%3Cscript%20src%3D%22jquery142.js%22%3E%3C/script%3E%0A");
    	context.writeEscapedText("%09%09%3Cscript%20src%3D%22alligator.js%22%3E%3C/script%3E%0A");
    	context.writeEscapedText("%09%09%3Cscript%3E%0A");
    	context.writeEscapedText("%09%09%09function%20click1%28%29%7B%0A");
    	context.writeEscapedText("%09%09%09%09server%28%22test%22%2Cfunction%28text%29%7B%0A");
    	context.writeEscapedText("%09%09%09%09%09%24%28%22%23hello%22%29.html%28text%29%3B%0A");
    	context.writeEscapedText("%09%09%09%09%7D%29%3B%0A");
    	context.writeEscapedText("%09%09%09%7D%0A");
    	context.writeEscapedText("%09%09%3C/script%3E%0A");
    	context.writeEscapedText("%09%3C/head%3E%0A");
    	context.writeEscapedText("%09%3Cbody%3E%0A");
    	context.writeEscapedText("%09%09%3Cspan%20id%3D%22hello%22%3E%3C/span%3E%3Cbr/%3E%0A");
    	context.writeEscapedText("%09%09%20%3Cform%3E%0A");
    	context.writeEscapedText("%20%09%09%09%3Cinput%20type%3D%22button%22%20id%3D%22button1%22%20value%3D%22click%20me%22%20onclick%3D%22click1%28%29%22%20/%3E%0A");
    	context.writeEscapedText("%20%09%09%3C/form%3E%0A");
    	context.writeEscapedText("%09%3C/body%3E%0A");
    	context.writeEscapedText("%3C/html%3E%0A");
    };
    
    this.test = function(context){
    	context.write("hello ajax world");
    };

In case Memcached is enabled, the application and session contexts are being saved there.

# Configuration

Configuration is through a JSON text file - `settings.json` in
the same folder as `alligator.js`.

Example settings file:

    {
    	"web_app_name" : "Alligator TestApp",
    	"port"         : 8080,
    	"path"         : {
    				     	"root" : "/home/vadmin/ws/Alligator/WWW/",
    				     	"lib"  : "/home/vadmin/ws/Alligator/WWWlib/"
    			},
    	"server_script": {
    				     	 "template_ext"          : "jssp",
    					     "script_ext"            : "ssjs",
    					     "begin"                 : "<?",
    					     "write" 				 : "=",
    					     "global" 				 : "!",
    					     "end"                   : "?>",
                    	     "session_minutes"       : 1,
    				    	 "memcached"             : {
    													   "enable" : 0,
    													   "server" : "localhost",
    													   "port"   : 11211
    					                           		}
    			         },
    	"logs"		   :{
    						"Engine"		:"DEBUG",
    						"ASemaphore"	:"ERROR",
    						"Session"		:"ERROR",
    						"Application"	:"ERROR",
    						"Page"			:"DEBUG"
    					},
    	"nodes"	       : 1
    }

This server listens on port 8080 for HTTP requests.

Explanation of properties:

- `web_app_name` - the name of the current web application
- `port` - the server listen to this port (default = 80)
- `path.root` - the root folder for the static and dynamic files (default = WWW)
- `path.lib` - the folder for JavaScript files that will get loaded automatically - you can access those via lib.fileName.yourStuff (default = None)
- `server_script.template_ext` - the extension of files that contains of server-side template (default = 'jssp')
- `server_script.script_ext` - the extension of files that contains of server-side script (default = 'ssjs')
- `server_script.begin` - the beginning tag for server-side scripting (default = '<?')
- `server_script.write` - in case coming right after the `server_script.begin` (e.g. '<?=') it auto warp the content with context.write()  (default = '=')
- `server_script.global` - in case coming right after the `server_script.begin` (e.g. '<?!') it adds the content outside the page() function  (default = '=')
- `server_script.end` - the end tag for server-side scripting (default = '?>')
- `server_script.session_minutes` - session timeout after X minutes (default = 30)
- `server_script.memcached` - integration with memcached
- `logs` - the log level for each module
- `nodes` - number of process running this application server ** currently we support shared memory using memcached! we recommand to set the number of nodes as the number of cores

# Bugs and Contribution
Please let us know if you find any bug or if you would like to contribute code: mrohad.jsf at gmail

Known Bugs - http://github.com/mrohad/Alligator/blob/master/knowBugs.txt

# Credits

Original code forked from AntiNode @ http://github.com/mhansen/antinode
We are using Multi-node @ http://github.com/kriszyp/multi-node
