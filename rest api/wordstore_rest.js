// REST API to the "word store and count" service
//
//

var debuglevel = 0;
var util = require('util'); // for util.inspect(); THIS WAS VERY HELPFUL.

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
    db.run("CREATE TABLE IF NOT EXISTS words (word TEXT UNIQUE, ct INTEGER DEFAULT 1)");
    console.log("DB created");
});

//removed separate queries for with/without counts to simplify code.
var getWord = db.prepare('SELECT word, ct FROM words WHERE word = (?)');
var insertWord = db.prepare('INSERT INTO words (word) VALUES (?)');
var incrementWordCount = db.prepare('UPDATE words SET ct = ct + 1 WHERE word = (?)');
var getAllWords = db.prepare('SELECT word, ct FROM words');

var oneWordError = '{ "error": "PUT requests must be one word in length" }';
var badFormatError = '{ "error": "PUT requests must be in proper JSON format" }';

app.get('/words', function(req, res) {
    // res.send("GET for /words" + req.params);
    console.log("GET for /words" + req.params);

    var outarr = {}; // empty object. Using [] made an array which isn't associative by design
   
    getAllWords.all(function(err, row){ // skipped first string parameter, seems OK.
	if(err !== null) {
	    console.log(err); // was next(err);
	}
	else {
	    if(row.length) { //assume defined and > 0
		for (r in row) {
		    //console.log(JSON.stringify(row));
		    //console.log(JSON.stringify(r));
		    //console.log(JSON.stringify(row[r]));
		    //outarr.push(row[r]['word'] + " : " + row[r]['count']);
		    outarr[row[r]['word']] = row[r]['ct'];
		}
		console.log(row.length);
	    }	    
	}

	// res.status(200).send('{\n' + outstr + '\n}\n');
	res.status(200).send(JSON.stringify(outarr));
    });
    
});
console.log("GET for /words set up");


app.put('/word/:word', function(req, res){

    console.log("PUT for /word/" + req.params.word);

    // Fun fact: I switched to using an object in the 'GET for all words' instead of an
    // array above but didn't quite realize that the same mechanism was at work for
    // the row object returned from a query.  The lack of associative-array-like behavior
    // that I was seeking was also evident below when I was trying to get row.length
    // and not being sure why it was undefined. Hooray for learning new things!
    
    getWord.get(req.params.word, function(err, row) {
	//changed from run to get to all, row now less undefined	
	console.log("getWord " + err + " ~~~ " + row);
    
	if(err !== null) {
	    console.log(err);
	}
	
	else if (row !== undefined) {
	    console.log("row inspect:" + util.inspect(row, {showHidden: false, depth: 3}));
	    
	    if (row['word'] === req.params.word) { //exists so update / increment
		incrementWordCount.run(req.params.word, function(err, row){
		    
		    console.log("Incrementing count for " + req.params.word);
		});
	    }
	    else { // something weird going on with more than one row for a single word
		console.log("Something weird going on with " + req.params.word);
	    }
	    
	} // end else if (row)
	else { // row undefined
	    // does not exist so create with default count of 1
	    insertWord.run(req.params.word, function(err, row){
		console.log("Inserting " + req.params.word);
	    });
	}
		
    });

    res.send("OK for PUT of " + req.params.word );
    
});

console.log("PUT for /word set up");


app.get('/word/:word', function(req, res){
    res.send("GET for /word/" + req.params.word);
    console.log("GET for /word/" + req.params.word);

});

console.log("GET for /word set up");


app.listen(8000); // actually begin our loop
console.log("Server started");
