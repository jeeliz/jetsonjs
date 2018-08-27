/*


*/

const WS=new(require('../wrappers/WSBroadcast'))()
let _AppWS

const onMessage=(typeLabel, dataDict)=>{
	switch(typeLabel){
		case 'STATUS':
			console.log('INFO in ExtWS : STATUS message received - data =', dataDict)
		break
		
		default:
			console.log('WARNING in ExtWS - onMessage : unknow message type ', typeLabel)
		break
	}
}

const init=(SETTINGS, AppWS)=>{
	_AppWS=AppWS
	WS.init({
		port: SETTINGS.server.serviceExtWSPort,
		callbackReady: ()=>{
			console.log('INFO in ExtWs.js - init() : WS server is ready and listenning...')
		},
		callbackMessage: onMessage,
		callbackConnect: ()=>{_AppWS.update_clientsCount()}//AppWS.update_clientsCount
	})
} 

//typically called to transmit a value from the AppWS service
const send_val=(val)=>{ 
	//console.log('INFO in ExtWs.js - send_val() : val = ', val)
	WS.send('VAL', val)
}

const get_clientsCount=()=>{
	return WS.count_clients()
}

module.exports={
	init: init,
	send_val: send_val,
	get_clientsCount: get_clientsCount
}
 
