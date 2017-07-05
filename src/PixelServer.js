/*

PixelServer.js hosts the server that saves the painted pixel datanp
    Brandon Asuncion (me@brandonasuncion.tech)

SETUP:
    $ npm install

RUNNING:
    $ npm start

*/

var PORT = 3001;                // Port to listen on
var CANVAS_WIDTH = 50;          // Dimensions of the canvas
var CANVAS_HEIGHT = 50;
var PAINT_LIMIT = 60;           // Minimum wait time between each draw request, per IP address (in seconds)


//  !!!!! DONT EDIT ANYTHING AFTER THIS !!!!!

var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server;

var timestamps = {};

var pixels = new Array(CANVAS_WIDTH);
for (var i = 0; i < CANVAS_WIDTH; i++)
    pixels[i] = Array(CANVAS_HEIGHT);

// Reset pixel array
function resetPixels() {
    for (var x = 0; x < CANVAS_WIDTH; x++) {
        for (var y = 0; y < CANVAS_HEIGHT; y++) {
            pixels[x][y] = {x, y, 'color': 0};
        }
    }
}

console.log('Pixel Websocket Server Initializing');
var ws = new WebSocketServer({port: PORT});

resetPixels();

ws.on('connection', function(socket) {
    var remoteIP = socket._socket.remoteAddress;

    var log = function(text) {
        console.log("[" + (new Date).toLocaleString() + "] " + remoteIP + " ->\t" + text);
    };

    //console.log('New Client: ' + remoteIP + '\t(' + ws.clients.size + ' connected)');
    log("New client connected\t(" + ws.clients.size + " total)");

    socket.send(JSON.stringify({
        'action': 'canvasInfo',
        'width': CANVAS_WIDTH,
        'height': CANVAS_HEIGHT
    }));

    socket.on('message', function(data) {
        var message_timestamp = new Date();

        var received;
        try {
            received = JSON.parse(data);
        } catch (e) {}
        var action = (received && received['action']) ? received['action'] : data;

        switch (action) {
            /*
            case 'clearCanvas':
                log('CLEARED CANVAS')
                resetPixels();
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


                if (remoteIP in timestamps) {
                    if (message_timestamp - timestamps[remoteIP] < PAINT_LIMIT * 1000) {
                        socket.send(JSON.stringify({
                            'action': 'timer',
                            'data': PAINT_LIMIT * 1000 - (message_timestamp - timestamps[remoteIP])
                        }));
                        socket.send(JSON.stringify({
                            'action': 'updatePixel',
                            'data': pixels[x][y]
                        }));
                        break;
                    }
                }

                if (x >= 0 && y >= 0 && x < CANVAS_WIDTH && y < CANVAS_HEIGHT) {

                    log('PAINT (' + x + ', ' + y + ') ' + color);

                    pixels[x][y]['color'] = color;
                    timestamps[remoteIP] = message_timestamp;

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
                    log('Invalid paint request');
                }
                break;

            case 'getPixel':
                var x = received['x'];
                var y = received['y'];
                console.log('GETPIXEL (' + x + ', ' + y + ')');

                socket.send(JSON.stringify({
                    'action': 'updatePixel',
                    'data': pixels[x][y]
                }));
                break;

            default:
                log('Invalid message');
                break;
        }
    });


    socket.on('error', function(exception) {
        console.log('Error encountered');
        console.log(exception);
    });

    socket.on('close', function() {
        log('Client disconnected (' + ws.clients.size + ' total)');
    });
});

console.log('Pixel Websocket Server Listening on port ' + PORT);
