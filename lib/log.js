var sys = require('sys');

function log(level, sector, args) {
    if (sectors[sector] == undefined || levels[level] >= sectors[sector] ) { 
        sys.print([(new Date()).format("dd/mm/yy HH:MM:ss"),"[",level,"] ",sector," : "].join(""));
        // Convert arguments object to an array so we can use
        // Array's join method on it
        sys.puts(Array.prototype.slice.call(args,1).join(" "));
    }
}
var sectors = [];
var levels = exports.levels = {
    "DEBUG" : 0, 
    "INFO" : 1,
    "WARN" : 2,
    "ERROR" : 3
};

//exports.level = levels.WARN;
exports.setLevel = function(sector,level){
	sectors[sector] = levels[level];
	log("DEBUG",sector,"1SET LOG level to - "+level );
};
exports.getLevel = function(sector){
	return sectors[sector];
};

exports.debug = function(sector) {
    log("DEBUG", sector, arguments);
};

exports.info = function(sector) {
    log("INFO", sector, arguments);
};

exports.warn = function(sector) {
    log("WARN", sector, arguments);
};

exports.error = function(sector) {
    log("ERROR", sector, arguments);
};