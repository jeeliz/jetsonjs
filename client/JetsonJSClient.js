/*
	This script implements the JETSONJSCLIENT api
	It should run into a web browser (not nodejs)
	it will transmit the data from the app (sampleApp for example)
	to the nodeJS server part using websockets

	The second role of this script is to transmit the network configuration

	You should include ../settings.js before using this script

	spec :
	   callbackReady : function called when the JetsonJSClient is ready,
	   callbackConnect : function launched with true if there is at least 1 client connected at the final app, 0 otherwise

*/

"use strict";

const JETSONJSCLIENT=(function(){
	//privates vars :
	let _socket
	const _states={
		notLoaded: 0,
		loading: 1,
		idle: 2,
		busy: 3,
		error: 4,
		reloading: 5
	}
	let _state=_states.notLoaded
	let _callbackConnect, _isClientConnected=-1 //-1,0 or 1

	const _wifiConfig={
		state: -1,
		domElements: {
			divWidget: false,
			
			selectNetworks: false,
			inputUser: false,
			inputPassword: false,

			divConnected: false,
			divDisconnected: false,
			divIP: false,

			buttonValidate: false,
			buttonRefresh: false
		},
		vals: {
			user: false,
			password: false,
			network: false,
			IP: '-'
		},
		networks: []
	}
	const _wifiStates={
		noSet: -1,
		busy: 1,
		connected: 2,
		disconnected: 0
	}

	//private methods :

	//BEGIN DOM UTILS
	function add_CSSClass(domElement, cssClass){
		if (domElement.className.indexOf(cssClass)!==-1){
			return;
		}
		domElement.className+=' '+cssClass;
	}

	function remove_CSSClass(domElement, cssClass){
		domElement.className=domElement.className.replace(cssClass, '');
	}

	function empty(domElement){
		domElement.innerHTML='';
	}
	//END DOM UTILS

	//BEGIN COMMUNICATION WITH SERVER PART
	function send(typeLabel, msg){
		if(_socket.readyState!==WebSocket.OPEN){
			return false
		}
		_socket.send(JSON.stringify({
			t: typeLabel,
			m: msg
		}))
		return true
	}

	function reloadPageDelayed(event){
		if (_state===_states.reloading){
			return
		}
		_state=_states.reloading;
		console.log('WARNING in JetsonJSClient : reloadPageDelayed() launched !')
		setTimeout(reload_ifAlive, SETTINGS.client.reloadTimeout)
	}

	function reload_ifAlive(){
		ping(location.href, (isAlive)=>{
			if (isAlive){
				location.reload()
			} else {
				console.log('WARNING in JetsonJSClient : server is still down...')
				setTimeout(reload_ifAlive, SETTINGS.client.reloadTimeout)
			}
		})
	}

	function ping(url, callback){ //test if URL is alive with a XHR
		var xmlHttp = new XMLHttpRequest()
        xmlHttp.open("GET", url, true)
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
            	if (xmlHttp.status===200){
                	callback(true)  //is alive OK
            	} else {
            		callback(false)
            	}
            }
        };
        xmlHttp.send()
	}

	function process_receivedMessage(event){
		//console.log('INFO in JetsonJSClient.js : message received = ', event.data)
	    const dataParsed=JSON.parse(event.data);
	    const typeLabel=dataParsed.t;
	    const data=dataParsed.m;
	    switch(typeLabel){
	    	case 'CLIENTSCOUNT':
	    		const newClientsConnected=(data===0)?0:1
	    		if (newClientsConnected!==_isClientConnected){
	    			_isClientConnected=newClientsConnected
	    			if (_callbackConnect){
	    				_callbackConnect(_isClientConnected)
	    			}
	    		}
	    	break

	    	case 'WIFIINFO':
	    		console.log('INFO in JetsonJSClient.js : WIFIINFO received = ', data);
	    		_wifiConfig.state=(data.connected)?_wifiStates.connected:_wifiStates.disconnected;
	    		
	    		_wifiConfig.vals.network=data.network;
	    		_wifiConfig.vals.user=data.user;
				_wifiConfig.vals.password=data.password;
				_wifiConfig.vals.IP=data.IP;

				_wifiConfig.networks=data.networks;
				update_wifiUI();
	    	break
	    } //end switch(typelabel)
	} //end process_receivedMessage

	function connect_toWsServer(callback){
		_socket=new WebSocket('ws://127.0.0.1:'+SETTINGS.server.serviceAppWSPort)
		
		// Connection opened
		_socket.addEventListener('open', function (event) {
			console.log('INFO in JetsonJSClient.js : connected!')
		    send('STATUS', 'OPEN')
		    _state=_states.idle
		    if (callback){
		    	callback()
		    }
		})

		// Listen for messages
		_socket.addEventListener('message', process_receivedMessage)

		_socket.addEventListener('error', reloadPageDelayed)
		_socket.addEventListener('close', reloadPageDelayed)
	} //end connect_toWsServer()
	//END COMMUNICATION WITH SERVER PART

	//BEGIN WIFI CONFIGURATION
	function update_wifiConfig(event){
		console.log('INFO in JetsonJSClient.js : update_wifiConfig() launched');
		var update_val=function(valKey, domKey){
			var domElt=_wifiConfig.domElements[domKey];
			if (!domElt) return;
			_wifiConfig.vals[valKey]=domElt.value;
		}
		update_val('user', 'inputUser');
		update_val('password', 'inputPassword');
		update_val('network', 'selectNetworks');
		_wifiConfig.state=_wifiStates.busy;
		update_wifiUI();
		send('WIFICONFIG', _wifiConfig.vals);
	}

	function update_wifiNetworksList(){
		console.log('INFO in JetsonJSClient.js : update_wifiNetworksList() launched');
		send('WIFIINFOS', 0);
		_wifiConfig.state=_wifiStates.busy;
		update_wifiUI();
	}

	//update wifiUI from _wifiConfig
	function update_wifiUI(){
		if (_wifiConfig.domElements.inputUser){
			_wifiConfig.domElements.inputUser.value=_wifiConfig.vals.user;
		}
		if (_wifiConfig.domElements.inputPassword){
			_wifiConfig.domElements.inputPassword.value=_wifiConfig.vals.password;
		}
		if (_wifiConfig.domElements.selectNetworks){
			empty(_wifiConfig.domElements.selectNetworks);
			_wifiConfig.networks.forEach(function(network){
				var domOption=document.createElement('option');
				domOption.value=network;
				domOption.innerHTML=network;
				if (network===_wifiConfig.vals.network){
					domOption.setAttribute('selected', true);
				}
				_wifiConfig.domElements.selectNetworks.appendChild(domOption);
			});
		}
		if (_wifiConfig.domElements.divIP){
			_wifiConfig.domElements.divIP.innerHTML=_wifiConfig.vals.IP;
		}
		if (_wifiConfig.domElements.divWidget){
			if (_wifiConfig.state===_wifiStates.busy){
				add_CSSClass(_wifiConfig.domElements.divWidget, 'wifiFrozen');
			} else {
				remove_CSSClass(_wifiConfig.domElements.divWidget, 'wifiFrozen');
			}
		}
	}
	//ENDWIFI CONFIGURATION

	//public methods :
	const that={
		'init': function(spec){ //entry point
			_state=_states.loading
			_callbackConnect=spec.callbackConnect
			connect_toWsServer(spec.callbackReady)

			if (spec.wifiConfigIds){
				console.log('INFO in JetsonJSClient.js - init() : a Wifi config is provided');
				Object.keys(_wifiConfig.domElements).forEach(function(domKey){
					var domId=spec.wifiConfigIds[domKey]
					var domElt=document.getElementById(domId)
					if (!domElt){
						console.log('WARNING in JetsonJSClient.js - init() : cannot found an input element which id =', domId, 'in the DOM')
						return
					}
					_wifiConfig.domElements[domKey]=domElt
				});

				if (_wifiConfig.domElements.buttonValidate){
					_wifiConfig.domElements.buttonValidate.addEventListener('click', update_wifiConfig, false)
				}
				if (_wifiConfig.domElements.buttonRefresh){
					_wifiConfig.domElements.buttonRefresh.addEventListener('click', update_wifiNetworksList, false)
				}
			}
		},	

		'send_value': function(dict){
			if (_state!==_states.idle){
				return
			}
			if (!send('VAL', dict)){
				console.log('ERROR in JetsonJSClient.js - send_value : the websocket is not in OPEN state. _socket.readyState =', _socket.readyState)
				_state=_states.error
				reloadPageDelayed()
			}
		},

		'exec_shellCmd': function(cmd){
			if (_state!==_states.idle){
				return false
			}
			return send('SHELLCMD', cmd)
		},

		'shutdown': function(){
			console.log('INFO in JetsonJSClient.js : shutdown() launched. THE DEVICE WILL SHUTDOWN BRO!!!')
			send('CMD', 'SHUTDOWN')
		}

	} //end that
	return that
})() //end closure