# JetsonJS

Embedded systems with JavaScript/WebGL.

![Jetson TX2](images/jetsonTX2.png?raw=true "Jetson TX2")


## Presentation

The [Jetson TX2](https://developer.nvidia.com/embedded/buy/jetson-tx2) is a SoM (System on Module) with a powerful GPU. It has no competitor on the market yet. It is mainly used for deep learning or image processing purposes, using Nvidia Cuda API or OpenCL.

We want to embed an application running with JavaScript/WebGL on a Nvidia Jetson. The application requires a good GPU computing power, that's why we use the Jetson instead of a cheaper Rasperry Pi. It is an application using a [Jeeliz library](https://github.com/jeeliz). For instance it can be a [pupillometry application](https://github.com/jeeliz/jeelizPupillometry) to build a standalone pupillometer.

With this project, we can setup the Jetson to run the application as an embedded application and possibly stream output data through websockets on a Wifi network. So we can transform a web application into an embedded application.

![Architecture](images/archi.png?raw=true "Architecture")


## Architecture

* `/client` : Client part of the application (running in the Jetson browser)
  * `/JetsonJSClient.js` : Client side API,
  * `/apps/` : Jetson web applications (`/apps/sampleApp` is the example application) which will run into the Jetson browser
* `/server` : NodeJS server part (running on the Jetson)
  * `/start.sh` : bash script to launch the server part
* `/test/index.html` : test the final web application and the connection with the Jetson. Should be launched in your browser (NOT the Jetson browser)
* `/settings.js` : configuration file, both for client and server side


## Setup

### Operating System
We advise to install Ubuntu 16.04 LTS on the Jetson TX2. You can follow these steps :

### JetsonJS

### Testing


## Specifications

### JetsonJSClient.js

`JetsonJSClient.js` and `settings.js` should be included in the HTML code of the web application running on the Jetson :
```html
<script src='auto/settings.js'></script>
<script src='auto/JetsonJSClient.js'></script>
```
You can take a look at [/client/apps/sampleApp/](/client/apps/sampleApp/) to get an example. These scripts are prefixed by `auto/` because they are automatically copied into `<app path>/auto/` when the nodeJS server is launched. After the loading of the page you should initialize `JETSONJSCLIENT` with :

```javascript
JETSONJSCLIENT.init({
	callbackReady:   //function called when the API is initialized,
	callbackConnect: //function called when the External client is connected or disconnected,
	   // the external client is the user in the final browser
	   // this function is called with a boolean as argument
	   // which is true if a user is connected, false otherwise
	   // this function allows to slow down the rendering loop to save the GPU
	   // if no user is connected
	wifiConfigIds: //dictionnary, to connect the Wifi widget to the controller
	   // see /client/apps/sampleApp/main.js to get an example
})
```

You can then use these methods :

`JETSONJSCLIENT.send_value(<dictionnary> dataDict)` : send a dictionnary of values to the server part. Example :
```javascript
JETSONJSCLIENT.send_value({
	signalCos: Math.cos(w),
	signalSin: Math.sin(w)
})
```

`JETSONJSCLIENT.exec_shellCmd()` : execute a shell command. It can be useful to switch ON/OFF the Jetson GPIOs

`JETSONJSCLIENT.shutdown()` : shutdown the Jetson. It is an hardware shutdown (equivalent to the Unix command `shutdown -h now`)


### Final webapp
The final web application (not running in the Jetson but on the user's browser) connects to the Jetson through websockets and get the values.
There is no buffering : if a value is sent from the Jetson when the user is not connected, this value will be lost. We would rather drop some values than introducing a latency. The [test application](/test/index.html), served statically by the NodeJS server on port 3000 show how to connect externally to the Jetson websocket server and read the values :
```javascript
var socket=new WebSocket('ws://'+jetsonIP+':8888') //port hould be server.serviceExtWSPort in settings.js
		
// Connection opened
socket.addEventListener('open', function (event) {
	console.log('Connected!')
});

// Listen for messages
var domLogs=document.getElementById('logs');
domLogs.value='';
socket.addEventListener('message', function (event) {
    var dataParsed=JSON.parse(event.data);
    var typeLabel=dataParsed.t;
    var data=dataParsed.m;

    switch(typeLabel){
    	case 'VAL':
    		domLogs.value+=JSON.stringify(data)+'\n'
    		break;
    }
});
```




## License
The MIT License (MIT)

Copyright (c) 2018 Jeeliz

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


## References
* [Jeeliz official website](https://jeeliz.com)
* [Nvidia Jetson Download center](https://developer.nvidia.com/embedded/downloads)
* Nvidia Jetson GPIOS (eLinux.org): [hardware](https://elinux.org/Jetson/GPIO), [software](https://elinux.org/Jetson/Tutorials/GPIO)
