// REST API to the "word store and count" service
//
//

var debuglevel = 0;


// Load HTTP module so we have something to talk to/with
var http = require('http');

// express for simpler routing
var express = require('express');
var app = express(); // not the most descriptive name but the only http handler we are using

// Load in SQLite and set up db
var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database("test.db"); //later, if we want to persist
var db = new sqlite3.Database(":memory:"); //default mode of readwrite | create
// we could have gotten away with a simple hash but I wanted to try out sqlite



db.serialize(function(){
    db.run("CREATE TABLE IF NOT EXISTS words (word TEXT UNIQUE, count INTEGER DEFAULT 1)");
    console.log("DB created");
});

//removed separate queries for with/without counts to simplify code.
var getWord = db.prepare('SELECT word, count from words WHERE word = (?)');
var insertWord = db.prepare('INSERT INTO words (word) VALUES (?)');
var incrementWordCount = db.prepare('UPDATE words SET count = count + 1 WHERE word = (?)');
var getAllWords = db.prepare('SELECT word, count from words');

var oneWordError = '{ "error": "PUT requests must be one word in length" }';
var badFormatError = '{ "error": "PUT requests must be in proper JSON format" }';

app.get('/words', function(req, res) {
    // res.send("GET for /words" + req.params);
    console.log("GET for /words" + req.params);

    var outstr = '';
    
    getAllWords.all(function(err, row){ // skipped first string parameter, seems OK.
	if(err !== null) {
	    console.log(err); // was next(err);
	}
	else {
	    if(row.length > 0)
		outstr = JSON.stringify(row);
		console.log(row.length);
	}

	res.status(200).send('{\n' + outstr + '\n}\n');
    });
    
});
console.log("GET for /words set up");


app.put('/word/:word', function(req, res){
    // res.send("PUT for /word/" + req.params.word);
    console.log("PUT for /word/" + req.params.word);

    getWord.run(req.params.word, function(err, row){
	if(err !== null) {
	    console.log(err);
	}
	else if (row) {
	    // no error
	    if (row.length === 1) { //exists so update / increment
		incrementWordCount.run(req.params.word, function(err, row){});
		console.log("Incrementing count for " + req.params.word);
	    }
//	    else if (row.length === 0) { // does not exist so create with default count of 1
//		insertWord.run(req.params.word, null);
//		console.log("Inserting " + req.params.word);
//	    }
	    else { // something weird going on with more than one row for a single word
		console.log("Something weird going on with " + req.params.word);
	    }
	    
	} // end else if (row)
	else { // row undefined
	    // does not exist so create with default count of 1
	    insertWord.run(req.params.word, function(err, row){});
	    console.log("Inserting " + req.params.word);
	}
	
//	else { // something weird going on with more than one row for a single word
//	    console.log("Returned row is " + row + " for " + req.params.word);
//	}
	
    });

    res.send("OK for PUT of " + req.params.word );
    
});

console.log("PUT for /word set up");


app.get('/word/:word', function(req, res){
    res.send("GET for /word/" + req.params.word);
    console.log("GET for /word/" + req.params.word);

});

console.log("GET for /word set up");



// http.createServer(function (req, res) {
//     var postdata = '';
//     // needed to init with '' to not get undefined later
    
//     console.log(req.method + ' request received');
//     res.writeHead(200, {'Content-type': 'text/plain'});

//     req.on('data', function(d) {
// 	postdata += d.toString();
// 	console.log(d.toString());
//     });
    
//     res.end(req.url + " ~~~ " + postdata);
    
// }).listen(8000); //so we don't step on existing open ports nor require root permissions


app.listen(8000); // actually begin our loop
console.log("Server started");
