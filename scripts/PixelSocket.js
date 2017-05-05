/*
    PixelSocket is a WebSocket wrapper for sending/receiving pixel information
*/
(function(window) {
    'use strict';

    function PixelSocket(server, autoconnect = false) {
        this.server = server;

        if (autoconnect)
            this.connect();
    }

    PixelSocket.prototype.connect = function() {
        this.socket = new WebSocket(this.server);
        this.socket.binaryType = 'arraybuffer';

        this.socket.onmessage = function(event) {

            if (event.data.byteLength == CANVAS_WIDTH * CANVAS_HEIGHT) {

                if (this.refreshCallback)
                  this.refreshCallback(new Uint8Array(event.data));

            } else if (this.messageHandler) {
                this.messageHandler(event.data);
            }

        }.bind(this);

        this.socket.onclose = function(event) {
            console.log('PixelSocket closed');
        };

        this.socket.onerror = function(event) {
            console.log('PixelSocket websocket error', event.data);
        };

        this.socket.onopen = function(event) {
            console.log('PixelSocket opened');
            this.requestRefresh();
        }.bind(this);
    };

    PixelSocket.prototype.sendPixel = function(x, y, colorID, username = ''){
        //console.log("SENDING PIXEL", x, y, colorID);
        this.socket.send(JSON.stringify({'action': 'paint', x, y, 'color': colorID, username}));
    };

    PixelSocket.prototype.getPixel = function(x, y){
        //console.log("REQUESTING PIXEL", x, y);
        this.socket.send(JSON.stringify({'action': 'getPixel', x, y}));
    };

    // message handler for responding to server commands
    PixelSocket.prototype.setMessageHandler = function(callback) {
        this.messageHandler = callback;
    };

    // asks the server to resend all the pixel data
    PixelSocket.prototype.requestRefresh = function() {
        this.socket.send('refreshPixels');
    }

    // set handler for canvas refreshes
    PixelSocket.prototype.setCanvasRefreshHandler = function(callback) {
        this.refreshCallback = callback;
    };

    window.PixelSocket = PixelSocket;
})(window);
