Alligator is a simple application server built on top of AntiNode and Node.js 

Latest Version 0.37

# Usage

Run it from the command line. 

   $ node alligator.js 

Requires Node.JS v0.1.99 or greater.
If you want to bind to a port under 1024, you'll need to run node with special
privileges.

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
						     "begin_additional_write": "=",
						     "end"                   : "?>",
	                	     "session_minutes"       : 30,
					    	 "memcached"             : {
														   "enable" : 0,
														   "server" : "localhost",
														   "port"   :11211
						                           		}
				         },
		"debug_mode"   : 1,
		"nodes"	       : 1
	}


This server listens on port 8080 for HTTP requests.

Explanation of properties:

- `web_app_name` - the name of the current web application
- `port` - the server listen to this port (default = 80)
- `path.root` - the root folder for the static and dynamic files (default = WWW)
- `path.lib` - the folder for JavaScript files that will get loaded automatically - you can access those via lib.fileName.yourStuff (default = None)
- `server_script.template_ext` - the extension of files that contains of server-side template (default = jssp)
- `server_script.script_ext` - the extension of files that contains of server-side script (default = sjs)
- `server_script.begin` - the beginning tag for server-side scripting (default = <?)
- `server_script.end` - the end tag for server-side scripting (default = ?>)
- `server_script.session_minutes` - session timeout after X minutes (default = 30)
- `server_script.memcached` - integration with memcached 
- `debug_mode` - 1 for debug mode, 0 for non-debug mode, on debug mode we add the exception to the response + the log level = debug
- `nodes` - number of process running this application server ** currently we support shared memory using memcached! we recommand to set the number of nodes as the number of cores



# Features
- Handling request parameters easily (for GET and POST)
- Distributed session management, including timeout
- Distributed application scope management
- Dynamic js loader (the lib folder)
- User can set the server-side script begin and end tags
- Utilizing all the cores per cpu (the `nodes` settings parameter)

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
			context.log.debug("SESSIONLOGIC.JSSP, value - " +value);
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
	
	}			


**Please note that behind the scene Alligator translate JSSP file to SSJS file upon the first request to this JSSP file(lazy)
**and later on use the SSJS file only.
**One can develop SSJS files instead of JSSP which makes the translation unnecessary.
**Alligator invokes the page() function.  

In case Memcached is enabled, the application and session contexts are being saved there.
	
# Bugs and Contribution
Please let us know if you find any bug or if you would like to contribute code: mrohad.jsf at gmail

Known Bugs - http://github.com/mrohad/Alligator/blob/master/knowBugs.txt

# Credits

Original code forked from AntiNode @ http://github.com/mhansen/antinode
We are using Multi-node @ http://github.com/kriszyp/multi-node
