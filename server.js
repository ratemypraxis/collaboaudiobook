// We need the file system here
var fs = require('fs');
				
// Express is a node module for building HTTP servers
var express = require('express');
var app = express();

// Tell Express to look in the "public" folder for any files first
app.use(express.static('public'));


const bodyParser = require('body-parser');
const multer  = require('multer');
const upload = multer();


// If the user just goes to the "route" / then run this function
app.get('/', function (req, res) {
  res.send('Hello World!')
});

// Create a shared playlist
let sharedPlaylist = [];

// Parse JSON request body
app.use(bodyParser.json());

// Here is the actual HTTP server 
// In this case, HTTPS (secure) server
var https = require('https');

// Security options - key and certificate
var options = {
  key: fs.readFileSync('privkey1.pem'),
  cert: fs.readFileSync('cert1.pem')
};

// We pass in the Express object and the options object
var httpServer = https.createServer(options, app);

// Default HTTPS port
httpServer.listen(443);

// WebSocket Portion
// WebSockets work with the HTTP server
// Using Socket.io
const { Server } = require('socket.io');
const io = new Server(httpServer, {});

// Old version of Socket.io
//var io = require('socket.io').listen(httpServer);

let users = {};

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);

        
		users[socket.id] = socket;


        socket.on('named', function(namedata) {
			// Data comes in as whatever was sent, including objects

            users[socket.id].username = namedata;
			
			// Send it to all of the clients
			io.sockets.emit('named', namedata);
		});

		 // Handle the 'addRecording' event
		 socket.on('addRecording', blob => {
			console.log(blob)

		  });


		//shared server audio clip attempt 1

		socket.on('sound-clip', function(blob) {
			// Data comes in as whatever was sent, including objects
			
			// Send it to all of the clients
			io.sockets.emit('sound-clip', blob);
		});

		//shared server audio clip attemp 2
		socket.on('audio', function(data){
			console.log(data);
			fs.writeFile(__dirname + '/x.webm', data, function(err){
				if (err) console.log(err);
				console.log("It's saved!")
			});
		});

		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('chatmessage', function(chatdata) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'chatmessage' " + chatdata);

            chatdata = namedata + chatdata;
			
			// Send it to all of the clients
			io.emit('chatmessage', chatdata);
		});
		
		// socket.on('disconnected', function(leftdata) {
		// 	console.log("Client has disconnected " + socket.id);
		// 	leftdata = users[socket.id].username + "has left the chat :+/" + leftdata;
		// 	io.emit('disconnected', leftdata);
		// });
	}
);
