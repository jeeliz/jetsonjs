const piWifi = require('pi-wifi') //DOC HERE : https://github.com/matrix-io/pi-wifi. based on wpaSupplicant
//if not working, test this one based on network-manager : https://www.npmjs.com/package/node-wifi


//return a list of WIFI SSID :
const get_networks=(callback)=>{

	//FOR DEBUG :
	/*setTimeout(()=>{
		callback([{ssid: 'network0'},{ssid: 'network1'}])
	}, 500); return;
	//*/

	piWifi.listNetworks((err, networksArray) => {
	  if (err) {
	  	callback([])
	    return console.log('ERROR in Wifi.js - get_neworks():', err.message)
	  }
	  //console.log(networksArray);
	  callback(networksArray)
	})

	// =>
	// [{ network_id: 0, ssid: 'MyNetwork', bssid: 'any', flags: '[DISABLED]' },
	// { network_id: 1, ssid: 'Skynet', bssid: 'any', flags: '[CURRENT]' }]
}


/*
networkDetails = {
  ssid: 'MyNetwork',
  username: 'demo',
  password: 'swordfish'
}
*/
const connect=(networkDetails, callback)=>{
	piWifi.connectTo(networkDetails, (err) => {
	  if(!err) {
	    console.log('INFO in Wifi.js - connect() : connected successfully')
	    //callback(false)
	    piWifi.status(null, (err, status)=>{
	    	if (err){
	    		console.log('WARNING in Wifi.js - connect() : cannot get status. err = ', err.message)
	    		callback(err, false)
	    	} else {
	    		console.log('INFO in Wifi.js - connect() : connected successfully and status got')
	    		callback(false, status)
	    	}
	    })
	  } else {
	  	console.log('WARNING in Wifi.js - connect() : connection fails', err.message)
	  	callback(err, false)
	  }
	})
}



module.exports={
	get_networks: get_networks,
	connect: connect
} 
