# Pixel
[![Build Status](https://travis-ci.org/brandonasuncion/Pixel.svg?branch=master)](https://travis-ci.org/brandonasuncion/Pixel)
[![npm (scoped)](https://img.shields.io/npm/v/@cycle/core.svg)]()
[![Hex.pm](https://img.shields.io/hexpm/l/plug.svg)]()

Pixel is a real-time collaborative canvas inspired off of Reddit's Place. It uses the EaselJS JavaScript library to interact with an HTML5 canvas element, and uses MongoDB to store pixel data. It's open source, and it's entirely scriptable!

Though, unlike Reddit Place, everything is anonymous. However, it can be configured to set a rate limit for each IP address.

Try it out yourself! A [live demo](https://pixel--1.herokuapp.com/) is available!

## Setup / Deployment
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### General Setup
1. Install the Node.js dependencies.
	```
	$ npm install
	```
2. If your webserver is running on a different public server than the WebSocket server, modify `src/public/scripts/pixel-config.js` to point to your WebSocket server.  
	eg.
	```javascript
	PIXEL_SERVER: "ws://127.0.0.1:3001",
	```

3. **(Optional)** Adjust the dimensions of the canvas, zoom settings, or even the color palette.
	```javascript
	CANVAS_WIDTH: 50,
	CANVAS_HEIGHT: 50,
	CANVAS_INITIAL_ZOOM: 20,
	CANVAS_MIN_ZOOM: 10,
	CANVAS_MAX_ZOOM: 40,
	CANVAS_COLORS: ["#eeeeee", "red", "orange", "yellow", "green", "blue", "purple", "#614126", "white", "black"]
	```

	NOTE: The canvas size needs to be set in two places (one for the server and one for the browser). For the server set at the top of PixeServer.js, and for
	the browser set in pixel-config.js.


4. **(Optional)** Enable MongoDB support by creating a database with a collection named `pixels`.  
	When running the script, make sure the `MONGODB_URI` environment variable is set. In Heroku, it's under `Settings -> Config Variables`.  
	*Note:* If the MongoDB URI is not set, all pixel data will only be kept in memory and will not be saved after a script reload.

### Deployment
1. Run the WebSocket server.
	```
	$ npm start
	```
2. Upload the `src/public/` folder to your webserver of choice.

### Dependencies
* [Node.js](https://nodejs.org/en/)
* [EaselJS](http://www.createjs.com/easeljs)
* [toastr](https://github.com/CodeSeven/toastr)
* [jQuery](https://jquery.com/)

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
[Brandon Asuncion](mailto:me@brandonasuncion.dev)  
[hanslivingstone](https://github.com/hanslivingstone) - Added Support for Rectangular Canvases


## Acknowlegements
[Reddit Place](https://redditblog.com/2017/04/13/how-we-built-rplace/)

## License
[Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/)
