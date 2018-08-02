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


## License
The MIT License (MIT)

Copyright (c) 2018 Jeeliz

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


## References
* [Jeeliz official website](https://jeeliz.com)
* [Nvidia Jetson Download center](https://developer.nvidia.com/embedded/downloads)

