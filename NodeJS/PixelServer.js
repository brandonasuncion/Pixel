/*

PixelServer.js hosts the server that saves the painted pixel data

SETUP:
	$ npm install

RUNNING:
	$ npm start

*/

var CANVAS_WIDTH = 50;
var CANVAS_HEIGHT = 50;

var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server;
var port = 3001;
var ws = new WebSocketServer({port: port});

var pixels = new Array(CANVAS_WIDTH);
for (var i = 0; i < CANVAS_WIDTH; i++)
	pixels[i] = Array(CANVAS_HEIGHT);

// Initialize pixel array
function initPixels() {
	for (var x = 0; x < CANVAS_WIDTH; x++) {
		for (var y = 0; y < CANVAS_HEIGHT; y++) {
			pixels[x][y] = {x, y, 'color': 0};
		}
	}
}

console.log('Pixel Websocket Server Initializing');
initPixels();

ws.on('connection', function(socket) {
	console.log('New Client (' + ws.clients.size + ' connected)');

	socket.send(JSON.stringify({
		'action': 'canvasInfo',
		'width': CANVAS_WIDTH,
		'height': CANVAS_HEIGHT
	}));

	socket.on('message', function(data) {

		var received;
		try {
			received = JSON.parse(data);
		} catch (e) {}
		var action = (received && received['action']) ? received['action'] : data;

		switch (action) {
			/*
			case 'clearCanvas':
				console.log('CLEARED CANVAS')
				initPixels();
				break;
			*/
			case 'refreshPixels':
				console.log('REFRESH PIXELS REQUEST FROM CLIENT');

				var pixelArray = new Uint8Array(CANVAS_WIDTH * CANVAS_WIDTH);
				for (var x = 0; x < CANVAS_WIDTH; x++) {
					for (var y = 0; y < CANVAS_HEIGHT; y++) {
						pixelArray[x + y * CANVAS_HEIGHT] = pixels[x][y]['color'];
					}
				}
				socket.send(pixelArray);
				break;

			case 'paint':
				var x = received['x'];
				var y = received['y'];
				var color = received['color'];
				console.log('PAINT', x, y, color);

				if (x >= 0 && y >= 0 && x < CANVAS_WIDTH && y < CANVAS_HEIGHT) {

					pixels[x][y]['color'] = color;
					pixels[x][y]['date'] = Date.now();

					var sendData = JSON.stringify({
						'action': 'updatePixel',
						'data': pixels[x][y]
					});
					ws.clients.forEach(function(client) {
						if ((client !== socket) && (client.readyState === WebSocket.OPEN)) {
							client.send(sendData);
						}

					});

				} else {
					console.log('Invalid paint request');
				}
				break;

			case 'getPixel':
				var x = received['x'];
				var y = received['y'];
				console.log('GETPIXEL', x, y);

				socket.send(JSON.stringify({
					'action': 'updatePixel',
					'data': pixels[x][y]
				}));
				break;

			default:
				console.log('Invalid message');
				break;
		}
	});


	socket.on('error', function(exception) {
		console.log('Error encountered');
		console.log(exception);
	});

	socket.on('close', function() {
		console.log('Client Disconnected (' + ws.clients.size + ' connected)');
	});
});

console.log('Pixel Websocket Server Initialization Complete');
