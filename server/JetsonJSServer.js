// get the settings files:
let _settingsFile = '../settings'
if (process.argv && process.argv.length && process.argv.length>2){
  _settingsFile = process.argv[2].split('.js').shift() // remove .js extension if necessary
  if (_settingsFile[0] !== '/'){
    _settingsFile = '/' + _settingsFile
  }
  _settingsFile = '..' + _settingsFile
  console.log('INFO in JetsonJSServer.js: use a custom settings file. _settingsFile =', _settingsFile)
}

const SETTINGS = require(_settingsFile)
SETTINGS._settingsFile = _settingsFile

const GPIO = require('./wrappers/GPIO')
GPIO.init(SETTINGS)

const EXECSH = require('./wrappers/ExecSh')

// HTTP Services:
const ServiceAppHTTP = require('./services/AppHTTP')
const ServiceTestHTTP = require('./services/TestHTTP')

// WS Services:
const ServiceAppWS = require('./services/AppWS')
const ServiceExtWS = require('./services/ExtWS')

// initialize HTTP services:
ServiceAppHTTP.init(SETTINGS)
ServiceTestHTTP.init(SETTINGS)

// initialize WS services:
ServiceExtWS.init(SETTINGS, ServiceAppWS)
ServiceAppWS.init(SETTINGS, ServiceExtWS)

// launch the client side with electron if required in the settings:
if (SETTINGS.client.isAutoStartElectron){
  console.log('INFO in JetsonJSServer.js: start electron client...')
  setTimeout(EXECSH.exec_cmd.bind(null, '../client/electron/startElectronClient.sh ' + _settingsFile, false), 1000)
}

// launch the checkdisk if required in the settings:
let _checkDiskTimer = null
if (SETTINGS.server.checkDisk){
  const check_disk = () => {

    EXECSH.exec_cmd('ls ' + SETTINGS.server.checkDisk.path, (isSuccess, stdout, stderr)=>{
      console.log('Checkdsk: stderr=', stderr.length, ',err=', isSuccess)
      if (!isSuccess || stderr.length){
        //EXECSH.exec_cmd('..'+SETTINGS.server.checkDisk.command, false)
        process.exit(1)
      } else {
        setTimeout(check_disk, SETTINGS.server.checkDisk.interval)
      }
    })    
  }

  check_disk()
}