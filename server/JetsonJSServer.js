const  SETTINGS = require('../settings')

//HTTP Services:
const ServiceAppHTTP = require('./services/AppHTTP')
const ServiceTestHTTP = require('./services/TestHTTP')

//WS Services:
const ServiceAppWS = require('./services/AppWS')
const ServiceExtWS = require('./services/ExtWS')

//initialize HTTP services:
ServiceAppHTTP.init(SETTINGS)
ServiceTestHTTP.init(SETTINGS)

//initialize WS services:
ServiceExtWS.init(SETTINGS, ServiceAppWS)
ServiceAppWS.init(SETTINGS, ServiceExtWS)

//launch the client side with electron if required in the settings:
if (SETTINGS.client.isAutoStartElectron){
	console.log('INFO in JetsonJSServer.js: start electron client...')
	const { exec } = require('child_process')

	exec('../client/electron/startElectronClient.sh', (err, stdout, stderr) => {
	  if (err) {
	    console.log('ERROR in JetsonJSServer.js: cannot launch electron client. Err=', err)
	    return
	  }

	  // the *entire* stdout and stderr (buffered)
	  console.log(`INFO in JetsonJSServer.js: stdout= ${stdout}`)
	  console.log(`INFO in JetsonJEServer.js: stderr=: ${stderr}`)
	})
}