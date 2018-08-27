const SETTINGS = require('../settings')
const EXECSH = require('./wrappers/ExecSh')

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
	setTimeout(EXECSH.exec_cmd.bind(null, '../client/electron/startElectronClient.sh', false), 1000)
}