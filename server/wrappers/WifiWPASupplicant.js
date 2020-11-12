const PIWIFI = require('pi-wifi') // DOC HERE: https://github.com/matrix-io/pi-wifi. based on wpaSupplicant
const FS = require('fs')

const _wifiConfigFileURL = '../wifiConfigs/wifiConfig.json'


// return a list of WIFI SSID:
const get_networks = (callback)=>{

  // FOR DEBUG:
  /*setTimeout(()=>{
    callback([{ssid: 'network0'},{ssid: 'network1'}])
  }, 500); return;
  //*/

  PIWIFI.listNetworks((err, networksArray) => {
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
const connect = (networkDetails, callback)=>{
  PIWIFI.connectTo(networkDetails, (err) => {
    if(!err) {
      console.log('INFO in Wifi.js - connect(): connected successfully')
      get_status((err, status)=>{
        if (err) {
          callback(err, false)
        } else {
          save_config(networkDetails, callback.bind(null,false, status))
        }
      })
    } else {
      console.log('WARNING in Wifi.js - connect(): connection fails', err.message)
      callback(err, false)
    }
  })
}

const get_status = (callback)=>{
  PIWIFI.status(null, (err, status)=>{
      if (err){
        console.log('WARNING in Wifi.js - get_status(): cannot get status. err = ', err.message)
        callback(err, false)
      } else {
        console.log('INFO in Wifi.js - get_status(): connected successfully and status got')
        callback(false, status)
      }
  })
}

const save_config = (networkDetails, callback)=>{
  const configStr = JSON.stringify(networkDetails)
  console.log('INFO in Wifi.js - save_config() ', configStr)
  FS.writeFile(_wifiConfigFileURL, configStr, 'utf8', callback)
}

const load_configSaved = (callback)=>{
  FS.exists(_wifiConfigFileURL, (isExists)=>{
      if(isExists){
        FS.readFile(_wifiConfigFileURL, (err, data)=>{
          if (err) {
            console.log('ERROR in Wifi.js - load_config(): err=', err)
            callback(false, false)
            return
          }
          const networkDetails = JSON.parse(data)
          connect(networkDetails, (err, status)=>{
            if (err){ //not connected
              callback(networkDetails, false)
            } else { //co
              callback(networkDetails, status)
            }
          })
        })
      } else {
        callback(false, false)
      }
  })
}

module.exports = {
  load_configSaved: load_configSaved,
  get_networks: get_networks,
  connect: connect
} 
