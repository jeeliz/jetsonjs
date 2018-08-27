const wifi = require('node-wifi') //DOC HERE: https://www.npmjs.com/package/node-wifi. based on NetworkManager
								  //CODE HERE: https://github.com/friedrith/node-wifi#readme
const FS = require('fs')
const OS = require('os')


const _wifiConfigFileURL='../wifiConfigs/wifiConfig.json'



wifi.init({
    iface : null // network interface, choose a random wifi interface if set to null
})


//return a list of WIFI SSID :
const get_networks=(callback)=>{
	wifi.scan((err, networks) => {
	    if (err) {
	        console.log('ERROR in Wifi.js - get_networks(): ',err)
	        callback([])
	    } else {
	    	callback(networks)
	        /*
	        networks = [
	            {
	              ssid: '...',
	              bssid: '...',
	              mac: '...', // equals to bssid (for retrocompatibility)
	              channel: <number>,
	              frequency: <number>, // in MHz
	              signal_level: <number>, // in dB
	              security: 'WPA WPA2' // format depending on locale for open networks in Windows
	              security_flags: '...' // encryption protocols (format currently depending of the OS)
	              mode: '...' // network mode like Infra (format currently depending of the OS)
	            },
	            ...
	        ];
	        */
	    }
	});
}


/*
networkDetails = {
  ssid: 'MyNetwork',
  username: 'demo',
  password: 'swordfish'
}
*/
const connect=(networkDetails, callback)=>{
	// Connect to a network
	wifi.connect(networkDetails, (err) => {
	    if (err) {
	        console.log('WARNING in Wifi.js - connect(): connection fails', err.message)
	  		callback(err, false)
	  		return
	    }
	    console.log('INFO in Wifi.js - connect() : connected successfully')
	    get_status((err, status)=>{
	    	if (err) {
	    		callback(err, false)
	    	} else {
	    		save_config(networkDetails, callback.bind(null,false, status))
	    	}
	    })
	})
}


const get_IPadress=(ifaceKey, callback)=>{ //inspired from https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
	const ifaces = OS.networkInterfaces()
	const iface=ifaces[ifaceKey]
	callback(iface[0].address)
}


const get_status=(callback)=>{
	wifi.getCurrentConnections((err, currentConnections) => {
	    if (err) {
	    	console.log('WARNING in Wifi.js - get_status() : cannot get status. err = ', err)
	    	callback(err, false)
	    } else {
	    	console.log('INFO in Wifi.js - get_status() : connected successfully and status got')
	    	const status=(currentConnections.length)?currentConnections[0]:false
	    	if (status && status.iface && !status.ip){
	    		//get the IP
	    		get_IPadress(status.iface, (ip)=>{
	    			status.ip=ip
	    			callback(false, status)
	    		})
	    	} else {
    			callback(false, status)
    		}
	    }
    })
}

const save_config=(networkDetails, callback)=>{
	const configStr=JSON.stringify(networkDetails)
	console.log('INFO in Wifi.js - save_config() ', configStr)
	FS.writeFile(_wifiConfigFileURL, configStr, 'utf8', callback)
}

const load_configSaved=(callback)=>{
	FS.exists(_wifiConfigFileURL, (isExists)=>{
    	if(isExists){
    		FS.readFile(_wifiConfigFileURL, (err, data)=>{
    			if (err) {
    				console.log('ERROR in Wifi.js - load_config() : err=', err)
    				callback(false, false)
    				return
    			}
    			const networkDetails=JSON.parse(data)
    			connect(networkDetails, (err, status)=>{
    				if (err){ //not connected
    					callback(networkDetails, false)
    				} else { //co
    					callback(networkDetails, status)
    				}
    			})
    		})
    	} else {
    		callback(false, false)
    	}
   	})
}

module.exports={
	get_status: get_status,
	load_configSaved: load_configSaved,
	get_networks: get_networks,
	connect: connect
} 
