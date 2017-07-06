# Pixel
[![Build Status](https://travis-ci.org/brandonasuncion/Pixel.svg?branch=master)](https://travis-ci.org/brandonasuncion/Pixel)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/df68113b2b3249708caff6601de9a665)](https://www.codacy.com/app/brandonasuncion/Pixel?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=brandonasuncion/Pixel&amp;utm_campaign=Badge_Grade)
[![npm (scoped)](https://img.shields.io/npm/v/@cycle/core.svg)]()
[![Hex.pm](https://img.shields.io/hexpm/l/plug.svg)]()

Pixel is a real-time collaborative canvas inspired off of Reddit's Place. It uses the EaselJS JavaScript library to interact with an HTML5 canvas element, and uses NodeJS as a backend to store pixel data. Also, it's scriptable!

Though, unlike Reddit Place, everything is anonymous. However, it can be configured to set a rate limit for each IP address.

Try it out yourself! A [live demo](http://pixel.brandonasuncion.tech/) is available!

### Dependencies
* [Node.js](https://nodejs.org/en/)
* [EaselJS](http://www.createjs.com/easeljs)
* [toastr](https://github.com/CodeSeven/toastr)
* [jQuery](https://jquery.com/)

## General Setup / Running

### Setup
1. Modify `src/public/scripts/pixel-config.js` to point to your public address.
	```javascript
	var PIXEL_SERVER = 'ws://127.0.0.1:3001';
	```
2. Optionally, you can change the default dimensions of the canvas, zoom settings, and even the colors used.
	```javascript
	CANVAS_WIDTH: 50,
	CANVAS_HEIGHT: 50,
	CANVAS_INITIAL_ZOOM: 20,
	CANVAS_MIN_ZOOM: 10,
	CANVAS_MAX_ZOOM: 40,
	CANVAS_COLORS: ["#eeeeee", "red", "orange", "yellow", "green", "blue", "purple", "#614126", "white", "black"]
	```
3. Install the node module.
	```
	$ npm install
	```
	
### Running
1. Run the WebSocket server.
	```
	$ npm start
	```
2. Upload the `src/public/` folder to your webserver of choice.

## Usage
1. Press a number between 1-9 to select a color, or 0 to erase.
2. Click on a pixel.

## PixelSocket Scripting and Automation
Pixel can be manipulated with the PixelSocket class (included in `PixelSocket.js`).

### Constructor and Methods:
* `PixelSocket(server, autoconnect = false)`  
	Creates a PixelSocket object for the specified server. If autoconnect is set to true, it connects automatically.
* `PixelSocket.connect()`  
	Connects to server specified in the constructor
* `PixelSocket.sendPixel(x, y, colorID)`  
	Sends a paint request to the server with the specified coordinates and color ID
* `PixelSocket.getPixel(x, y)`  
	Tells the server that we need to update a specific pixel
* `PixelSocket.setMessageHandler(callback)`  
	Specify the handler for client commands from the server
		eg. ps.setMessageHandler(function(data){ ... })
	"data" is a JS object containing an "action" attribute, specifying the type of message

	* Action:	`canvasInfo`  
		Server sends updated canvas dimensions  
		Attributes:		'width', 'height'  
		
	* Action: `updatePixel`  
		Server notifies the client a pixel was updated with coordinates  
		Attributes: 'x', 'y', 'color'  
		
	* Action: `timer`  
		Server sends the time when the next pixel can be drawn  
		Attributes: 'time', 'type'  

* `PixelSocket.setCanvasRefreshHandler(callback)`  
	Specify the handler used for complete canvas refreshes

* `PixelSocket.requestRefresh()`  
	Tells the server that we need to refresh the entire canvas,
	and to resend all the pixel data

### Event Methods:
* `PixelSocket.onopen(event)`
* `PixelSocket.onerror(event)`
* `PixelSocket.onclose(event)`

## Credits
Brandon Asuncion <me@brandonasuncion.tech>

## Acknowlegements
[Reddit Place](https://redditblog.com/2017/04/13/how-we-built-rplace/)

## License
[Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/)