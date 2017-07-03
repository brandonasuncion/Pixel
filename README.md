# Pixel
[![Build Status](https://travis-ci.org/brandonasuncion/Pixel.svg?branch=master)](https://travis-ci.org/brandonasuncion/Pixel)

Pixel is a real-time collaborative canvas inspired off of Reddit's Place. It uses the EaselJS JavaScript library to interact with an HTML5 canvas element, and uses NodeJS as a backend to store pixel data.

However, unlike Reddit Place, Pixel does not have a time limit for each user. Everything is anonymous.

A [live demo](https://brandonasuncion.github.io/Pixel/www/) is available. Please note, the live demo does not have real-time collaboration enabled.

### Dependencies
* [Node.js](https://nodejs.org/en/)
* [EaselJS](http://www.createjs.com/easeljs)
* [jQuery](https://jquery.com/)

## General Setup / Deployment

### Setup
1. Modify src/public/scripts/main.js to point to your public address.
	```
	var PIXEL_SERVER = 'ws://127.0.0.1:3001';
	```
2. Install the node module.
	```
	$ npm install
	```
	
### Running
1. Run the WebSocket server.
	```
	$ npm start
	```
2. Upload the /www/ folder to your webserver of choice.

## Deploying on Google App Engine

1. Clone the repository to your App Engine Instance
	```
	$ git clone https://github.com/brandonasuncion/Pixel.git
	```
2. cd into the Pixel directory and follow the setup above.
	```
	$ cd Pixel
	$ npm install
	```
3. Create a firewall rule within the Cloud Platform Console to open port 3001 for TCP traffic.
4. Upload `src/public/ ` to a webserver, or see [here](https://cloud.google.com/appengine/docs/flexible/nodejs/serving-static-files) for other methods to serve static files.
4. Deploy the application within Google App Engine.
	```
	$ gcloud app deploy
	```

## Usage
1. Press a number between 1-9 to select a color, or 0 to erase.
2. Click on a pixel.

## Credits
Brandon Asuncion - me@brandonasuncion.tech

## Acknowlegements
[Reddit Place](https://redditblog.com/2017/04/13/how-we-built-rplace/)

## License
[Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/)