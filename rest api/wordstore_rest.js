// REST API to the "word store and count" service
//
//

// Load HTTP module so we have something to talk to/with
var http = require('http');

http.createServer(function (req, res) {
    console.log(req.method + ' request received');
    res.writeHead(200, {'Content-type': 'text/plain'});
    res.end(req.url);
}).listen(8000); //so we don't step on existing open ports nor require root permissions


console.log("Server started");
