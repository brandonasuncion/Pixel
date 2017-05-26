# Pixel

Pixel is a real-time collaborative canvas inspired off of Reddit's Place. It uses the EaselJS JavaScript library to interact with an HTML5 canvas element, and uses NodeJS as a backend to store pixel data.

However, unlike Reddit Place, Pixel does not have a time limit for each user. Everything is anonymous.

## Getting Started

### Dependencies
* [Node.js](https://nodejs.org/en/)
* [EaselJS](http://www.createjs.com/easeljs)
* [jQuery](https://jquery.com/)

### Setup
1. Modify /www/scripts/main.js to point to your public address. 
	```
	var PIXEL_SERVER = 'ws://127.0.0.1:3001';
	```
2. Within the NodeJS folder, install the node modules.
	```
	$ npm install
	```
	
### Running
1. Within the NodeJS folder, run the WebSocket server.
	```
	$ npm start
	```
2. Upload the /www/ folder to your webserver of choice.

### Usage
1. Press a number between 1-9 to select a color, or 0 to erase.
2. Click on a pixel.

## Credits
Brandon Asuncion - me@brandonasuncion.tech

## Acknowlegements
[Reddit Place](https://redditblog.com/2017/04/13/how-we-built-rplace/)