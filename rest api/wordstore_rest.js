// REST API to the "word store and count" service
//
//

var debuglevel = 0;


// Load HTTP module so we have something to talk to/with
var http = require('http');

// Load in SQLite and set up db
var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database("test.db");
var db = new sqlite3.Database(":memory:"); //default mode of readwrite | create

db.serialize(function(){
    db.run("CREATE TABLE if not exists rest_words (word TEXT UNIQUE, count INTEGER)");
    console.log("DB created");
    
});



http.createServer(function (req, res) {
    console.log(req.method + ' request received');
    res.writeHead(200, {'Content-type': 'text/plain'});
    res.end(req.url);
}).listen(8000); //so we don't step on existing open ports nor require root permissions


console.log("Server started");
