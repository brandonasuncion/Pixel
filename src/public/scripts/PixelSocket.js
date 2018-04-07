/*
	PixelSocket is a WebSocket wrapper for sending/receiving pixel information to the Pixel Node.js backend

	CREDITS
		Brandon Asuncion <me@brandonasuncion.tech>

*/
(function(window) {
	"use strict";

	function PixelSocket(server, autoconnect = false) {
		this.server = server;
		this.expectedRefreshSize = undefined;
		if (autoconnect) this.connect();
	}

	PixelSocket.prototype.connect = function() {
		this.socket = new WebSocket(this.server);
		this.socket.binaryType = "arraybuffer";

		this.socket.onmessage = function(event) {

			if (event.data.byteLength && event.data.byteLength === this.expectedRefreshSize) {

				if (this.refreshCallback)
					this.refreshCallback(new Uint8Array(event.data));
				else
					console.log("No refresh callback specified.")

			} else if (this.messageHandler) {
				var received;
				try {
					received = JSON.parse(event.data);
				} catch(e) {
					return;
				}
				if (!received || !received.action){
					console.log("Received unformatted or unknown command from server", data);
					return;
				}

				if (received.action === 'canvasInfo') {
					this.expectedRefreshSize = received.width * received.height;
					return;
				}

				this.messageHandler(received);
			}

		}.bind(this);

		this.socket.onclose = function(event) {
			console.log("PixelSocket closed");
			if (this.onclose) this.onclose(event);
		}.bind(this);

		this.socket.onerror = function(event) {
			console.log("PixelSocket websocket error", event.data);
			if (this.onerror) this.onerror(event);
		}.bind(this);

		this.socket.onopen = function(event) {
			console.log("PixelSocket opened");
			if (this.onopen) this.onopen(event);
			this.requestRefresh();

			setInterval(function() {
				this.socket.send('{"action":"ping"}')
			}, 15000);
		}.bind(this);
	};

	PixelSocket.prototype.sendPixel = function(x, y, colorID){
		this.socket.send(JSON.stringify({"action": "paint", x, y, colorID}));
	};

	PixelSocket.prototype.getPixel = function(x, y){
		this.socket.send(JSON.stringify({"action": "getPixel", x, y}));
	};

	PixelSocket.prototype.setMessageHandler = function(callback) {
		this.messageHandler = callback;
	};

	PixelSocket.prototype.setCanvasRefreshHandler = function(callback) {
		this.refreshCallback = callback;
	};

	PixelSocket.prototype.requestRefresh = function() {
		this.socket.send("refreshPixels");
	};

	window.PixelSocket = PixelSocket;
})(window);
