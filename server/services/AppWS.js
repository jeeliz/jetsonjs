/*
	
	  

*/
const WS=new(require('./WSBroadcast'))()
const WIFI=require('./Wifi')
const { exec } = require('child_process')

let _ExtWS, _ssids=[], _isConnected=false, _wifiConfig={
	network: '',
	user: '',
	password: '',
	IP: ''
}

const onMessage=(typeLabel, dataDict)=>{
	switch(typeLabel){
		case 'STATUS':
			console.log('INFO in AppWS : STATUS message received - data =', dataDict)
		break
		
		case 'VAL':
			//console.log('Val received :', dataDict)
			//transmit the value to the ExtWS
			_ExtWS.send_val(dataDict)
		break

		case 'WIFIINFOS': //refresh the list of networks
			console.log('INFO in AppWS : WIFIINFOS message received (ask for networks list)')
			WIFI.get_networks((networks)=>{
				_ssids = networks.map((network)=>{return network.ssid})
				send_wifiInfo()
			})
			break;

		case 'WIFICONFIG': //set wificonfig
			console.log('INFO in AppWS : WIFICONFIG message received - data =', dataDict)
			if (dataDict.network!==false){
				_wifiConfig.network=dataDict.network
			}
			if (dataDict.user!==false){
				_wifiConfig.user=dataDict.user
			}
			if (dataDict.password!==false){
				_wifiConfig.password=dataDict.password
			}
			WIFI.connect({
				ssid: _wifiConfig.network,
  				username: _wifiConfig.user,
  				password: _wifiConfig.password
			}, (err, status)=>{
				if (err){
					console.log('ERROR in AppWS : cannot connect to the WIFI network - err =', err)
					_isConnected=false
					send_wifiInfo()
				} else {
					console.log('INFO in AppWS :successfully connected to WIFI network. status =', status)
					_isConnected=true
					_wifiConfig.IP=status.ip
					send_wifiInfo()
				}
			})
			break

		case 'CMD':
			console.log('INFO in AppWS : CMD received - CMD =', dataDict)
			switch(dataDict){
				case 'SHUTDOWN':
				exec('shutdown -h now', (isSuccess, stdOut, stdErr)=>{
					
				})
				break
			}
			break;

		case 'SHELLCMD':
			console.log('INFO in AppWS : SHELLCMD received - SHELLCMD =', dataDict)
			exec(dataDict, (isSuccess, stdOut, stdErr)=>{

				})
			break

		default:
			console.log('WARNING in AppWS - onMessage : unknow message type ', typeLabel)
		break
	}
}

const exec_cmd=(shellCmd, callback)=>{
	exec(shellCmd, (err, stdout, stderr) => {
	  if (err) {
	  	console.log('WARNING in AppWS - exec_cmd() : cannot execute the command ', shellCmd, 'err =', err)
	  	callback(false, '', '')
	    return
	  }

	  // the *entire* stdout and stderr (buffered)
	  console.log('INFO in AppWS - exec_cmd() : ', shellCmd, 'results:')
	  console.log(`stdout: ${stdout}`)
	  console.log(`stderr: ${stderr}`)
	  callback(true, stdout, stderr)
	})
}

const send_wifiInfo=()=>{
	WS.send('WIFIINFO', {
		networks: _ssids,
		connected: _isConnected,
		network:  _wifiConfig.network,
		user:  _wifiConfig.user,
		password:  _wifiConfig.password,
		IP: _wifiConfig.IP
	})
}

const init=(SETTINGS, ExtWS)=>{
	_ExtWS=ExtWS
	WS.init({
		port: SETTINGS.server.serviceAppWSPort,
		callbackReady: ()=>{
			console.log('INFO in AppWs.js - init() : WS server is ready and listenning...')
			console.log('INFO in AppWS.js - init() : retrieve wifi config')
			WIFI.load_configSaved((conf, status)=>{
				if (!conf) return
				_wifiConfig.network=conf.ssid
				_wifiConfig.user=conf.username
				_wifiConfig.password=conf.password
				_wifiConfig.IP=(status&&status.ip)?status.ip:false
				_isConnected=(status&&status.ip)?true:false
				send_wifiInfo()
			})
		},
		callbackMessage: onMessage,
		callbackConnect: update_clientsCount
	})
} 

const update_clientsCount=()=>{
	const nClients=_ExtWS.get_clientsCount()
	console.log('INFO in AppWS - update_clientsCount() : number of clients connected to ExtWS =', nClients)
	WS.send('CLIENTSCOUNT', nClients)
}

module.exports={
	init: init,
	update_clientsCount: update_clientsCount
}
