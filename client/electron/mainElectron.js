const {app, BrowserWindow} = require('electron');
let settingsPath='../../settings'
if (process.argv && process.argv.length && process.argv.length>=2){
  settingsPath='../'+process.argv[2];
}
console.log('INFO in mainElectron.js: settingsPath=', settingsPath);
const SETTINGS=require(settingsPath);

let mainWindow;

// Chrome by default black lists certain GPUs because of bugs.
// if your are not able to view webgl try enabling --ignore-gpu-blacklist option
// But, this will make electron/chromium less stable.
app.commandLine.appendSwitch('--ignore-gpu-blacklist');
//app.commandLine.appendSwitch('--force-gpu-rasterization');

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({fullscreen: true,
	frame:false,
	minimizable:false,
	maximizable:false,
	alwaysOnTop:true,
	skipTaskBar:true,
	kiosk:true,
	title:'JetsonJS client',
	disableAutoHideCursor:true});

  // and load the index.html of the app.
  //mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.loadURL('http://127.0.0.1:'+SETTINGS.server.serviceAppHTTPPort+'/index.html');


  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
