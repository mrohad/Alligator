function server(action,cb){
	$.get("", { serverFunction: action},
			function(data) {
				cb(data);
			});
}