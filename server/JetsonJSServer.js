const  SETTINGS = require('../settings')

//HTTP Services :
const ServiceAppHTTP = require('./services/AppHTTP')
const ServiceTestHTTP = require('./services/TestHTTP')

//WS Services :
const ServiceAppWS = require('./services/AppWS')
const ServiceExtWS = require('./services/ExtWS')

//initialize HTTP services :
ServiceAppHTTP.init(SETTINGS)
ServiceTestHTTP.init(SETTINGS)

//initialize WS services :
ServiceExtWS.init(SETTINGS, ServiceAppWS)
ServiceAppWS.init(SETTINGS, ServiceExtWS)