# JetsonJS

Embedded systems with JavaScript/WebGL.

![Jetson TX2](images/jetsonTX2.png?raw=true "Jetson TX2")




## Table of contents

* [Presentation](#presentation)
* [Features](#features)
* [Architecture](#architecture)
* [Setup](#setup)
  * [Hardware hookup](#hardware-hookup)
  * [Wifi connection](#wifi-connection)
  * [Setup packages](#setup-packages)
  * [Security](#security)
  * [Add sudo rights](#add-sudo-rights)
* [Specifications](#specifications)
  * [JetsonJSClient.js](#jetsonjsclientjs)
  * [Final webapp](#final-webapp)
  * [Specify configuration file](#specify-configuration-file)
* [See also](#see-also)
* [License](#license)
* [References](#references)




## Presentation

The [Jetson TX2](https://developer.nvidia.com/embedded/buy/jetson-tx2) is a SoM (System on Module) with a powerful GPU. It has no competitor on the market yet. It is mainly used for deep learning or image processing purposes, using Nvidia Cuda API or OpenCL.

We want to embed an application running with JavaScript/WebGL on a Nvidia Jetson. The application requires a good GPU computing power, that's why we use the Jetson instead of a cheaper Rasperry Pi or equivalent. It is an application using a [Jeeliz library](https://github.com/jeeliz). For instance it can be a [pupillometry application](https://github.com/jeeliz/jeelizPupillometry) to build a standalone pupillometer.

With this project, we can setup the Jetson to run the application as an embedded application and possibly stream output data through websockets on a Wifi network. So we can transform a web application into an embedded application.

We do not use at all proprietary solutions like *Cuda* or *Jetpack*.

<p align="center">
<img src="images/archi.png?raw=true"/>
</p>


## Features
Mandatory key features:
* Server part running with Node.JS and providing:
  * A static HTTP service to host the client part
  * A dynamic Websocket service to communicate with the client part
* A client part served by the server part in a web context (either with a full web browser like *Chromium* or *Firefox* or ideally *Electron*) and doing a GPU intensive task using WebGL API.


Optional features:
* The client part can ask the server part to:
  * control the Jetson GPIOs
  * shutdown the Jetson
  * execute a specific bash command
  * connect to a wifi network
  * stream data to the server part
* The client part can be displayed on a touchscreen
* The client part can show these widgets:
  * a wifi configuration
  * a virtual keyboard (displayed on the touchscreen)
* The server part can:
  * stream the data from the jetson client to an external websocket service
  * host a test interface through HTTP to view the data streamed by the jetson client


## Architecture

* `/client`: Client part of the application (running in the Jetson browser)
  * `/JetsonJSClient.js`: Client side API
  * `/apps/`: Jetson web applications (`/apps/sampleApp` is the example application) which will run into the Jetson browser
  * `/electron/`: Electron wrapper and main script
  * `/libs/`: various JavaScript libraries, compied into `<appPath>/auto` and served with static HTTP server later
* `/debug/`: bash scripts, useful for debugging:
  * `/startChromium.sh`: start chromium browser on the Jetson
  * `/stopAll.sh`: stop `Xorg` and `node` on the Jetson
* `/server`: NodeJS server part (running on the Jetson)
  * `/JetsonJSServer.js`: main server script, launched with *NodeJS* by `startServer.sh`
  * `/startServer.sh`: bash script to launch the server part
  * `/services/`: one script per network service (either through HTTP, or websockets)
  * `/wrappers/`: various scripts to run shell commands, to play with GPIOs, to config wifi...
  * `/wifiConfigs/`: save wifi configurations here
* `/test/index.html`: test the final web application and the connection with the Jetson. Should be launched in your browser (NOT the Jetson browser)
* `/settings.js`: default configuration file, both for client and server side
* `/setup.sh`: the setup bash script (see [the setup section](#setup))
* `/start.sh`: the start bash script


## Setup

We advise to install Ubuntu 16.04 LTS on the Jetson TX2. The Jetson TX2 devkit comes with Ubuntu 16.04LTS. If you have Ubuntu 14.04LTS, simply run `sudo do-release-upgrade`. We advise to not upgrade to Ubuntu 18.04LTS. We do not use *Jetpack* at all. You can check your Ubuntu version by running:
```
cat /etc/issue
```

<aside class="warning">
Do a backup of your Jetson first! The setup script will remove some packages on your Jetson.
</aside>

### Hardware hookup
You need:
* A [Jetson devkit TX2](https://developer.nvidia.com/embedded/buy/jetson-tx2-devkit),
* A USB keyboard,
* A [USB hub](https://www.amazon.com/Hama-USB-2-0-Hub-Powered/dp/B0079R5LL0) to plug both keyboard and touchscreen to the single USB plug of the Jetson TX2,
* A [5 inches touchscreen HDMI display](https://www.amazon.com/gp/product/B0749D617J),
* A [HDMI cable](https://www.amazon.com/gp/product/B004COGP22), because it is not provided with the devkit or with the touchscreen,
* A [meta case in mini ITX format](https://www.amazon.com/MITXPC-MX500-Industrial-Mini-ITX-WallMount/dp/B01B575EMA) to put the Jetson, Devkit. It is not strictly necessary but it will protect the Jetson against electrostatic discharges or dust.

Instead of the touchscreen, you can also use a standard HDMI monitor and a mouse.

* Put the jetson devkit in the metal case using 4 screws,
* Plug the 2 wifi antennas provided with the Devkit,
* Plug the keyboard and the touchscreen (or the mouse) by USB,
* Plug the monitor to the HDMI,
* Power on and push the poweron button on the carrier board.


### Wifi connection
First we need to connect the Jetson to be able to download the required packages. If you have an ethernet cable, you can simply plug it to the Jetson and skip this part (and enter: `sudo dhclient eth0` if the connection is not automatic). If you do not have an ethernet access you need to connect to the wifi. It is a bit more difficult. In our example we connect to the university network [Eduroam](https://www.eduroam.us/). The configuration is a bit tricky and you may have to adapt it to your specific wifi settings.


We use *NetworkManager* in command line (not *WPASupplicant*).

View the available wifi networks:
```
nmcli device wifi list 
```

Connect to a network:
```
nmcli con add con-name <SSIDOFYOURNETWORK> ifname wlan0 type wifi ssid <SSIDOFYOURNETWORK>
nmcli con edit <SSIDOFYOURNETWORK>
nmcli> set ipv4.method auto
nmcli> set 802-1x.eap peap
nmcli> set 802-1x.identity <USERIFUSED>
nmcli> set 802-1x.phase2-auth mschapv2
nmcli> save
nmcli> quit
```

then edit the generated configuration file:
```
sudo vi /etc/NetworkManager/system-connections/<SSIDOFYOURNETWORK>
```

and put (type `i` to enter insert mode) :
```
[wifi]
mode=infrastructure
...
[wifi-security]
group=
key-mgmt=wpa-eap
pairwise=
proto=
...
[802-1x]
password=<PASSWORD>
...
```
Press `ESC` to exit insert mode, then write `:w` then `:q`.

Finally restart network manager and connect:
```
sudo service network-manager restart
sudo nmcli con up <SSIDOFYOURNETWORK>
```

If it does not work, take a look at `/var/log/syslog`, `nmcli` logs into this file. Enter `ifconfig` to check that it is connected and to get the Jetson IP address, then connect to ssh from your computer:

```
ssh nvidia@<IPOFTHEJETSON>
```
The password is `nvidia`.


### Setup packages
First we install the graphic drivers and we reboot. They are already on the Jetson memory, provided by Nvidia:
```
cd ~/NVIDIA-INSTALLER
sudo ./installer.sh
sudo reboot
```
Then I had to remove some locks and reconfigure some packages (I cannot simply update and upgrade I don't know why):
```
sudo rm /var/lib/apt/lists/lock
sudo rm /var/cache/apt/archives/lock
sudo rm /var/lib/dpkg/lock
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys F60F4B3D7FA2AF80
sudo apt-get update
sudo dpkg --configure -a
sudo apt-get upgrade
sudo apt-get dist-upgrade
sudo apt-get autoremove
sudo apt-get autoclean
```

Clone this repository in `~/`:
```
cd ~
git clone https://github.com/jeeliz/jetsonjs
```

Finally launch `/setup.sh` script. It will install *Matchbox window manager*, *Nodejs*, *Electron* and remove some useless stuffs:
```
cd ~/jetsonjs
./setup.sh
```

### Security
The password by default is `nvidia`. Change it with:
```
sudo passwd nvidia
```

There is also a default user, `ubuntu` whose password is `ubuntu`. change it with:
```
sudo passwd ubuntu
```

And change the password of the `root` user:
```
sudo passwd root
```

### Add sudo rights
Some scripts, like the GPIO setter script (*/server/wrappers/setGPIO.sh*) need to be executed as root. Run:
```
sudo visudo
```
and add:
```
nvidia ALL=(ALL) NOPASSWD: /home/nvidia/jetsonjs/server/wrappers/
nvidia ALL=(ALL) NOPASSWD: /sbin/shutdown
nvidia ALL=(ALL) NOPASSWD: /bin/mount
```
Save and exit.




## Specifications

### JetsonJSClient.js

`JetsonJSClient.js` and `settings.js` should be included in the HTML code of the web application running on the Jetson :
```html
<script src='auto/settings.js'></script>
<script src='auto/JetsonJSClient.js'></script>
```
You can take a look at [/client/apps/sampleApp/](/client/apps/sampleApp/) to get an example. These scripts are prefixed by `auto/` because they are automatically hosted as `<app path>/auto/` when the nodeJS server is launched. After the loading of the page you should initialize `JETSONJSCLIENT` with :

```javascript
JETSONJSCLIENT.init({
  callbackReady:   //function, called when the API is initialized,
  callbackConnect: //function, called when the External client is connected or disconnected,
     // the external client is the user in the final browser
     // this function is called with a boolean as argument
     // which is true if a user is connected, false otherwise
     // this function allows to slow down the rendering loop to save the GPU
     // if no user is connected
  wifiConfigIds: //dictionnary, to connect the Wifi widget to the controller
     // see /client/apps/sampleApp/main.js to get an example
  keyboardTargetsClass: //string, class of the <input> where a virtual keyboard should be displayed
     // see  /client/apps/sampleApp/main.js to get an example
     // of integration of the virtual keyboard
  keyboardAttachId: //string, id of the element where the keyboard will be attached
})
```

You can then use these methods :

`JETSONJSCLIENT.send_value(<dictionnary> dataDict)`: send a dictionnary of values to the server part. Example :
```javascript
JETSONJSCLIENT.send_value({
	signalCos: Math.cos(w),
	signalSin: Math.sin(w)
})
```

`JETSONJSCLIENT.exec_shellCmd()`: execute a shell command. It can be useful to switch ON/OFF the Jetson GPIOs

`JETSONJSCLIENT.fetch_wifi()`: update the wifi networks list

`JETSONJSCLIENT.set_GPIO(<int>number, <boolean>val)`: set the GPIO port number `number` to value `val`

`JETSONJSCLIENT.shutdown()`: shutdown the Jetson. It is an hardware shutdown (equivalent to the Unix command `shutdown -h now`)

`JETSONJSCLIENT.close()`: close the Electron window. Usefull for debug

`JETSONJSCLIENT.open_electronDevTools()`: open Electron development tools (for debugging purpose)

`JETSONJSCLIENT.is_inElectron()`: returns whether the script runs into electron or not


### Final webapp
The final web application (not running in the Jetson but on the user's browser) connects to the Jetson through websockets and get the values.

This part is not mandatory: you can use JetsonJS to run JavaScript/WebGL code on the Jetson without linking it to an external web application. For example if the jetson is directly pluggued to an HDMI display.


There is no buffering: if a value is sent from the Jetson when the user is not connected, this value will be lost. We would rather drop some values than introducing a latency. The [test application](/test/index.html), served statically by the NodeJS server on port 3000 show how to connect externally to the Jetson websocket server and read the values :
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

## Specify configuration file
it is possible to specify another configuration file than `settings.js`.
It can be useful to serve a client application and to use a configuration file outside the JetsonJS git repository.
To specify a custom configuration file, you need to launch:
```
start.sh <pathOfConfigurationFile>
```
The path of the configuration file should be given as a relative path, from the root path of this project.


## See also
[@Jeeliz](https://jeeliz.com) we have developed a very fast deep learning technology running in JavaScript/WebGL. It runs fully client side using the GPU of the device. It is perfect for progressive web applications. It is so fast that it can analyze video in real-time for these applications:

* glasses virtual tryon: [demo web application](https://jeeliz.com/sunglasses), [github repository of our VTO widget](https://github.com/jeeliz/jeelizGlassesVTOWidget),
* Snapchat/Facebook lenses like interactive face filters: [github repository of our "FaceFilter" library](https://github.com/jeeliz/jeelizFaceFilter),
* augmented reality, interfaced with WebXR: [github repository of our "JeelizAR" library](https://github.com/jeeliz/jeelizAR),
* in browser expression recognition: [github repository of our "Weboji" library](https://github.com/jeeliz/jeelizWeboji),
* or even pupillometry: [github repository of our pupillometry project](https://github.com/jeeliz/jeelizPupillometry).

In some use cases, we need to embed our solution (for kiosks or IOT). The standard software stack proposed on the Jetson is useless with our framework because we do not use *Cuda*, so we did JetsonJS. Now, our technology can really run everywhere (embedded, mobile, desktop and web)!

Stay tunned to our bleeding edge developments by subscribing to our [Youtube channel](https://www.youtube.com/channel/UC3XmXH1T3d1XFyOhrRiiUeA) or [Twitter @StartupJeeliz](https://twitter.com/StartupJeeliz) or our [Linkedin page](https://fr.linkedin.com/company/jeeliz).



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
* Electron: [official website](https://electronjs.org/), [sample apps](https://github.com/hokein/electron-sample-apps)
* Matchbox window manager: [source repositories](http://git.yoctoproject.org/)
* Control the GPIOs: [Jetson support forum post](https://devtalk.nvidia.com/default/topic/1020887/jetson-tx2/how-to-configure-a-gpio-on-tx2-/)