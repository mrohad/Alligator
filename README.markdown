Alligator is a simple application server built on top of AntiNode and Node.js 

Latest Version 0.3

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
		"port"         : 82,
		"path"         : {
					"root":"/home/vadmin/Alligator/WWW/",
					"lib":"/home/vadmin/Alligator/WWWlib/"
				},
		"server_script": {
					"ext":"jssp",
					"begin":"<?",
					"begin_additional_write":"=",
					"end":"?>",
					"session_minutes":1,
					"memcached":{
							"enable":0,
							"server":"localhost",
							"port":11211
						}
				 },
		"debug_mode"   : 1,
		"nodes"	       : 2
	}

This server listens on port 8080 for HTTP requests.

Explanation of properties:

- `web_app_name` - the name of the current web application
- `port` - the server listen to this port (default = 80)
- `path.root` - the root folder for the static and dynamic files (default = WWW)
- `path.lib` - the folder for JavaScript files that will get loaded automatically - you can access those via lib.fileName.yourStuff (default = None)
- `server_script.ext` - the extension of files that contains of server-side script (default = jssp)
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

He/She can use the following implicit functions/variables:

- `request` for handling the request
- `request.parameters` to read and write request post/get parameters
- `responseHead.header` to add headers of the response (e.g. responseHead.header["set-cookie"] = "..";)
- `responseHead.status` to change the HTTP response status
- `commands.write(str)` to add string to the response body (or instead one can use the <?=str?> tag)
- `commands.forward(other.jssp)` to forward the request and response to another server-side resource
- `commands.sendRedirect(url)` to send HTTP redirect response back to the client
- `lib.filename.member` to access whatever lib one has loaded 
- `session.set(key,value,callbackFunc)` to put anything on the HttpSession
- `session.get(key,callbackFunc)` to get anything from the HttpSession
- `application.set(key,value,callbackFunc)` to put anything on the application context
- `application.get(key,callbackFunc)` to get anything from the application context



#Examples
Ex1.jssp:
	<? var a = 1+1;?><br/>
	<? write(a);?>
Translates to:
	<br/>2
Once can achieve the same thing using Ex2.jssp
	<? var a = 1+1;?><br/>
	<?=a?>

One can forward from one jssp to another:
Exf1.jssp:
	<? var dbInfo= gettingInfoFromDatabase();
	   request.parameters.db = dbInfo;
           commands.forward("showTable.jssp");?>
showTable.jssp:
	<?=genetrateHTMLTable(request.parameters.db)?>

One can easily redirect:
	<? if(request.parameters.googleIt=="true")
		commands.sendRedirect("http://www.google.com");
	else{>
	<H1> Welcome...</H1>
	<?}?>

How to use the session scope, the counter Example: (separation of logic and view)
logic.jssp:
	<?
		var counter = 1;
		session.get("counter",function(value){
			log.debug("SESSIONLOGIC.JSSP, value - " +value);
			if(value == undefined){
				session.set("counter",1);
			}else{
				counter = value+1;
				session.set("counter",counter);
			}
			request.parameters.counter = counter;
			commands.forward("counter/view.jssp");				
		});				
	?>
view.jssp:
	<HTML>
		<HEAD><TITLE>Application Scope Counter Tester</TITLE></HEAD>
		<BODY>
		<?
			var counter = request.parameters.counter;
			if(counter==1)
				commands.write("First Time");
			else
				commands.write("Number of hits by you:" + counter);
				
		?>
		</BODY>
	</HTML>
	
In case Memcached is enabled, the application and session contexts are being saved there.
	
# Bugs and Contribution
Please let us know if you find any bug or if you would like to contribute code: mrohad.jsf at gmail

Known Bugs - http://github.com/mrohad/Alligator/blob/master/knowBugs.txt

# Credits

Original code forked from AntiNode @ http://github.com/mhansen/antinode
We are using Multi-node @ http://github.com/kriszyp/multi-node
