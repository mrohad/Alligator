var fs = require('fs'),
engine = require('./lib/engine'),
sys = require('sys');

fs.readFile(process.argv[2] || './settings.json', function(err, data) {
    var settings = {};
    if (err) {
        sys.puts('No settings.json found ('+err+'). Using default settings');
    } else {
        try {
            settings = JSON.parse(data.toString('utf8',0,data.length));
        } catch (e) {
            sys.puts('Error parsing settings.json: '+e);
            process.exit(1);
        }
    }
    engine.start(settings);
});



