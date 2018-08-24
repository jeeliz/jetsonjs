# JetsonJS

Embedded systems with JavaScript/WebGL.

![Jetson TX2](images/jetsonTX2.png?raw=true "Jetson TX2")


## Presentation

The [Jetson TX2](https://developer.nvidia.com/embedded/buy/jetson-tx2) is a SoM (System on Module) with a powerful GPU. It has no competitor on the market yet. It is mainly used for deep learning or image processing purposes, using Nvidia Cuda API or OpenCL.

We want to embed an application running with JavaScript/WebGL on a Nvidia Jetson. The application requires a good GPU computing power, that's why we use the Jetson instead of a cheaper Rasperry Pi. It is an application using a [Jeeliz library](https://github.com/jeeliz). For instance it can be a [pupillometry application](https://github.com/jeeliz/jeelizPupillometry) to build a standalone pupillometer.

With this project, we can setup the Jetson to run the application as an embedded application and possibly stream output data through websockets on a Wifi network. So we can transform a web application into an embedded application.

![Architecture](images/archi.png?raw=true "Architecture")


## Architecture

* `/client`: Client part of the application (running in the Jetson browser)
  * `/JetsonJSClient.js` : Client side API,
  * `/apps/`: Jetson web applications (`/apps/sampleApp` is the example application) which will run into the Jetson browser
* `/server`: NodeJS server part (running on the Jetson)
  * `/start.sh`: bash script to launch the server part
* `/test/index.html`: test the final web application and the connection with the Jetson. Should be launched in your browser (NOT the Jetson browser)
* `/settings.js`: configuration file, both for client and server side
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

`JETSONJSCLIENT.close()` : close the Electron window. Usefull for debug



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
* Electron: [official website](https://electronjs.org/), [sample apps](https://github.com/hokein/electron-sample-apps)
* Matchbox window manager: [source repositories](http://git.yoctoproject.org/)