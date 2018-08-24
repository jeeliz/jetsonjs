# ELECTRON WRAPPED APP

This is the Electron wrapper. Instead of launching the client part of the application in the browser, it will launch it using Electron.
The main advantages are:

* No security alert or popup (like the confirmation box when the webcam is requested)
* Its is more lightweight because it does not implement browser-specific features


Install Electron: 
```
sudo npm install electron -g
```

Then launch `./startElectronClient.sh'. The server part should be running. Note: it is possible and recommanded to launch the electron client part automatically after the server start by enabling `isAutoStartElectron` parameters in `/settings.js`.

To build this electron app, I got inspired by [the WebGL Electron sample app](https://github.com/hokein/electron-sample-apps/tree/master/webgl)