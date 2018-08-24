var _isSendValues=false

function iterate(){
	if (!_isSendValues) return;
	const w=2*Math.PI*Date.now()/1000;
	JETSONJSCLIENT.send_value({
		signalCos: Math.cos(w),
		signalSin: Math.sin(w)
	})
}

function startApp(){
	console.log('INFO in main() : startApp()')
	setInterval(iterate, 10)
}

function main(){ //entry point, called by body.onload()
	JETSONJSCLIENT.init({
		//keyboardTargetsClass: 'keyboard',

		wifiConfigIds:{
			divWidget: 'wifiConfig',
			
			selectNetworks: 'wifiNetworks',
			inputUser: 'wifiUser',
			inputPassword: 'wifiPassword',

			divConnected: 'wifiStatusConnected',
			divDisconnected: 'wifiStatusDisconnected',
			divIP: 'wifiStatusIP',

			buttonValidate: 'wifiConfig_valid',
			buttonRefresh: 'wifiConfig_refresh'
		},		

		callbackReady: startApp,
		callbackConnect: function(isClientConnected){
			_isSendValues=isClientConnected
			console.log('INFO in main.js : _isSendValues =', _isSendValues)
		}
	})
} 

