// REST API to the "word store and count" service
//
//

var debuglevel = 0;


// Load HTTP module so we have something to talk to/with
var http = require('http');

// Load in SQLite and set up db
var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database("test.db"); //later, if we want to persist
var db = new sqlite3.Database(":memory:"); //default mode of readwrite | create
// we could have gotten away with a simple hash but I wanted to try out sqlite


db.serialize(function(){
    db.run("CREATE TABLE if not exists words (word TEXT UNIQUE, count INTEGER DEFAULT 1)");
    console.log("DB created");
    
});

//removed separate queries for with/without counts to simplify code.
var getWord = db.prepare('SELECT word, count from words WHERE word = (?)');
var insertWord = db.prepare('INSERT INTO words (word) VALUES (?)');
var incrementWordCount = db.prepare('UPDATE words SET count = count + 1 WHERE word = (?)');
var getAllWords = db.prepare('SELECT word, count from words');


var oneWordError = '{ "error": "PUT requests must be one word in length" }';



http.createServer(function (req, res) {
    var postdata = '';
    // needed to init with '' to not get undefined later
    
    console.log(req.method + ' request received');
    res.writeHead(200, {'Content-type': 'text/plain'});

    req.on('data', function(d) {
	postdata += d.toString();
	console.log(d.toString());
    });
    
    res.end(req.url + " ~~~ " + postdata);
    
}).listen(8000); //so we don't step on existing open ports nor require root permissions


console.log("Server started");
