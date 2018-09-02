//WARNING: this is the default setting.js file
//if another settings file is specified as argument of start.sh or startServer.sh, it will use another one

const SETTINGS={
	client: { //settings for the client part
		reloadTimeout: 2000, //timeout before page reloading if error, in ms
		isAutoStartElectron: true
	},

	server: { //settings for the server part
		serviceAppHTTPPort: 8080, // http://127.0.0.1
		serviceTestHTTPPort: 3000, //if 0, disable this service
		serviceAppHTTPPath: '/client/apps/sampleApp/', //goven from jetsonJS path
		serviceAppWSPort: 5000,    // ws://127.0.0.1
		serviceExtWSPort: 8888,       // ws://<extIp>
		isInvertGPIO: true
	}
} 

//if node version :
if (typeof(module)==='object'){
	module.exports=SETTINGS
}
