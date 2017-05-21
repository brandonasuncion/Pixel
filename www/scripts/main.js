(function(window) {
	'use strict';
	var App = window.App || {};
	var $ = window.jQuery;
	var createjs = window.createjs;

	var PIXEL_SERVER = 'ws://127.0.0.1:3001';

	var CANVAS_ELEMENT_ID = 'pixelCanvas';
	var CANVAS_WIDTH = 50;
	var CANVAS_HEIGHT = 50;
	var CANVAS_INITIAL_ZOOM = 20;
	var CANVAS_MIN_ZOOM = 10;
	var CANVAS_MAX_ZOOM = 40;
	var CANVAS_COLORS = ['#eeeeee', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', '#614126', 'white', 'black'];

	var stage;									// EaselJS stage
	var pixels;									// EaselJS container to store all the pixels

	var zoom = CANVAS_INITIAL_ZOOM;				// zoom level

	var pixelMap = new Array(CANVAS_WIDTH);		// map of pixels
	for (var i = 0; i < CANVAS_WIDTH; i++)
		pixelMap[i] = Array(CANVAS_HEIGHT);

	var isDrawing = false;						// whether a new pixel to draw is being selected
	var drawingShape = new createjs.Shape();	// shape to render pixel selector
	var selectedColorID = 0;					// ID of color to draw

	var pixelSocket;							// for websocket connection

	/* START PixelSocket CODE */

	pixelSocket = new PixelSocket(PIXEL_SERVER);

	pixelSocket.setCanvasRefreshHandler(function(pixelData) {
		if (!pixels) return;
		console.log('Pixel data synced');
		for (var x = 0; x < CANVAS_WIDTH; x++) {
			for (var y = 0; y < CANVAS_HEIGHT; y++) {
				var colorID = pixelData[x + y * CANVAS_HEIGHT];
				var color = CANVAS_COLORS[colorID];

				if (colorID != pixelMap[x][y]['color']) {
					pixelMap[x][y]['shape'].graphics.beginFill(color).drawRect(x, y, 1, 1);
					pixelMap[x][y]['color'] = colorID;
				}
			}
		}
		stage.update();
	});

	pixelSocket.setMessageHandler(function(data) {

		var action, received;
			try {
				received = JSON.parse(data);
			action = received['action'];
			} catch(e) {
			console.log('Received unknown command from server', data);
			return;
			}

		switch (action) {
			case 'canvasInfo':	  // in case we want to control the canvas dimensions from the server
				CANVAS_WIDTH = received['width'];
				CANVAS_HEIGHT = received['height'];
				break;

			case 'updatePixel':
				if (!pixels) return;

				var x = received['data']['x'];
				var y = received['data']['y'];
				var colorID = received['data']['color'];
				var color = CANVAS_COLORS[colorID];
				console.log('Pixel Update', x, y, 'color', colorID);

				if (colorID != pixelMap[x][y]['color']) {
					pixelMap[x][y]['shape'].graphics.beginFill(color).drawRect(x, y, 1, 1);
				}
				received['data']['shape'] = pixelMap[x][y]['shape'];
				pixelMap[x][y] = received['data'];

				stage.update();
				break;

			default:
				break;
		}

	});

	pixelSocket.connect();
	/* END PixelSocket CODE */


	/* Enable pixel selector */
	function startDrawing(colorID = 0) {
		var color = CANVAS_COLORS[colorID];
		console.log('Selected Color', color);
		var p = pixels.globalToLocal(stage.mouseX, stage.mouseY);
		selectedColorID = colorID;
		drawingShape.graphics.clear().beginFill(CANVAS_COLORS[selectedColorID]).drawRect(0, 0, 1, 1);
		drawingShape.x = Math.floor(p.x);
		drawingShape.y = Math.floor(p.y);
		drawingShape.visible = true;
		isDrawing = true;
		$(screen.canvas).trigger('mousemove');
		stage.update();
	}

	/* Disable pixel selector, update canvas, and send data to server */
	function endDrawing(x, y) {
		if (x >= 0 && y >= 0 && x < CANVAS_WIDTH && y < CANVAS_HEIGHT) {
			console.log("Drawing to pixel", x, y, CANVAS_COLORS[selectedColorID]);
			pixelMap[x][y]['shape'].graphics.beginFill(CANVAS_COLORS[selectedColorID]).drawRect(x, y, 1, 1);

			// SEND PIXEL UPDATE TO SERVER!
			pixelSocket.sendPixel(x, y, selectedColorID);
		}
		drawingShape.visible = false;
		isDrawing = false;
		stage.update();
	}

	$(document).ready(function() {

		console.log('Initializing EaselJS Stage');
		stage = new createjs.Stage(CANVAS_ELEMENT_ID);

		var context = stage.canvas.getContext("2d");
		context.webkitImageSmoothingEnabled = context.mozImageSmoothingEnabled = false;

		// create a container to store all the pixels
		pixels = new createjs.Container();
		pixels.scaleX = zoom;
		pixels.scaleY = zoom;

		// create shape objects for each pixel and render them
		for (var x = 0; x < CANVAS_WIDTH; x++) {
			for (var y = 0; y < CANVAS_HEIGHT; y++) {
				var shape = new createjs.Shape();
				shape.graphics.beginFill('#eeeeee').drawRect(x, y, 1, 1);
				pixels.addChild(shape);
				pixelMap[x][y] = {'color': 0, 'shape': shape};
			}
		}

		pixels.addChild(drawingShape);
		stage.addChild(pixels);

		$(window).trigger('resize');
		pixels.x = (window.innerWidth - (CANVAS_INITIAL_ZOOM * CANVAS_WIDTH)) / 2;
		pixels.y = (window.innerHeight - (CANVAS_INITIAL_ZOOM * CANVAS_HEIGHT)) / 2;

		stage.update();
		console.log('Canvas Initialization done.')



		/* User selects color with number keys */
		$(document).keydown(function(e){
			var i = e.keyCode - 49;
			i += 1;			 // ignore the first color in the CANVAS_COLORS array
			if ((i >= 0) && (i < CANVAS_COLORS.length))
				startDrawing(i);
		});
		/* User selects the pixel to paint (if selector is active) */
		stage.addEventListener("click", function(e) {
			if (isDrawing){
				var p = pixels.globalToLocal(e.rawX, e.rawY);
				endDrawing(Math.floor(p.x), Math.floor(p.y));
			}
		});
		/* While the selector is active, move it to the pixel over the cursor */
		stage.on("stagemousemove", function(e){
			if (isDrawing) {
				var p = pixels.globalToLocal(e.rawX, e.rawY);
				drawingShape.x = Math.floor(p.x);
				drawingShape.y = Math.floor(p.y);
				stage.update();
			}
		});



		/* Code for panning the canvas around the screen */
		var dragX = 0;
		var dragY = 0;
		pixels.on("mousedown", function(e){
			dragX = e.rawX - pixels.x;
			dragY = e.rawY - pixels.y;
		});
		pixels.on("pressmove", function(e){
			// canvas panning
			pixels.x = e.rawX - dragX;
			pixels.y = e.rawY - dragY;
			stage.update();
		});

	});


	// zoom functionality
	$(window).on('mousewheel', function(e){
		e.preventDefault();
		zoom = (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) ? zoom + 1 : zoom - 1;
		zoom = Math.min(Math.max(zoom, CANVAS_MIN_ZOOM), CANVAS_MAX_ZOOM);
		//console.log("Zoom", zoom);

		// zoom in/out to cursor position
		var centerX = stage.mouseX;
		var centerY = stage.mouseY;

		var local = pixels.globalToLocal(centerX, centerY);
		pixels.regX = local.x;
		pixels.regY = local.y;
		pixels.x = centerX;
		pixels.y = centerY;
		pixels.scaleX = pixels.scaleY = zoom;
		stage.update();
	});


	$(window).on('resize', function(e){
		// canvas MUST always be a square, otherwise it will get distorted
		stage.canvas.width = stage.canvas.height = Math.max(window.innerHeight, window.innerWidth);
		stage.update();
	});

	window.CANVAS_WIDTH = CANVAS_WIDTH;
	window.CANVAS_HEIGHT = CANVAS_WIDTH;
	window.startDrawing = startDrawing;
	window.App = App;
})(window);
