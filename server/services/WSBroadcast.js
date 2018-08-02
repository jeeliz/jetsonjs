/*
 WS broadcast server
 
 Add an abstraction layer above websockets
 Because there are many NPM websocket packages...
*/
const WebSocket = require('ws') //doc here: https://www.npmjs.com/package/ws

function WSBroadcast(){

	this.ws=false

	/*
	 initialization. spec = dictionary with these keys :
	   - port: what is the port to listen
	   - callbackReady: called when connection is opened
	   - callbackMessage: called when a message is received. 2 arguments: message type and message content
	   - callbackConnect; called when a new client is connected with true when connected, false when unconnected
	*/
	this.init=(spec)=>{
		this.ws = new WebSocket.Server({ port: spec.port })

		//handle message reception :
		this.ws.on('connection', (client) => {
			console.log('INFO in WSBroadcast.js - init() : a new client is connected')

		  	client.on('message', (data) => {
		  		//console.log('msg rcv')
		  		const dataParsed=JSON.parse(data)
		    	spec.callbackMessage(dataParsed.t, dataParsed.m)
		  	})

			client.on('close', () => {
				if (spec.callbackConnect){
			  		spec.callbackConnect(false)
			  	}
			  	//console.log('disconnected')
			})

		  	if (spec.callbackConnect){
		  		spec.callbackConnect(true)
		  	}
		})

		spec.callbackReady()
		return true
	}

	this.send=(typeLabel, dataDict) => { //send a message to all connected clients
		if (!this.ws){
			console.log('WARNING in WSBroadcast.js - send() : not initialized.')
			return false
		}

		// format data :
		const dataFormatted = JSON.stringify({t: typeLabel, m: dataDict})

		// Broadcast to all :
		this.ws.clients.forEach((client) => {
		    if (client.readyState === WebSocket.OPEN) {
		      client.send(dataFormatted)
		    }
		})
		return true
	}

	this.count_clients=()=>{
		if (!this.ws || !this.ws.clients) {
			return 0
		}
		return this.ws.clients.size
	}

} //end WSBroadcast

module.exports=WSBroadcast

