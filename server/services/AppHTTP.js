const Fs = require('fs')
const StaticServer = require('static-server') //see https://www.npmjs.com/package/static-server for doc

const copy_file=(src, dst)=>{
	Fs.createReadStream(src).pipe(Fs.createWriteStream(dst))
}

const init=(SETTINGS)=>{
	const rootPath='../'
	const fullAppPath=rootPath+SETTINGS.server.serviceAppHTTPPath
	const fullAppAutoPath=fullAppPath+'auto/'

	//copy settings.js to the served path
	copy_file(rootPath+'settings.js', fullAppAutoPath+'settings.js')

	//copy JetsonJSclient to the served path
	copy_file(rootPath+'client/JetsonJSClient.js', fullAppAutoPath+'JetsonJSClient.js')


	//start the server :
	const server = new StaticServer({
	  rootPath: fullAppPath,            // required, the root of the server file tree
	  port: SETTINGS.server.serviceAppHTTPPort,               // required, the port to listen
	  name: 'App static http',   // optional, will set "X-Powered-by" HTTP header
	  host: '127.0.0.1',       // optional, defaults to any interface
	  cors: '*',                // optional, defaults to undefined
	  //followSymlink: false,      // optional, defaults to a 404 error
	  templates: {
	   // index: 'foo.html',      // optional, defaults to 'index.html'
	    notFound: '404.html'    // optional, defaults to undefined
	  }
	})
	 
	server.start(function () {
	  console.log('INFO in AppHTTP.js - init() : HTTP static server listening to', server.port)
	})
	 
	/*server.on('request', function (req, res) {
	  // req.path is the URL resource (file name) from server.rootPath
	  // req.elapsedTime returns a string of the request's elapsed time
	})
	 
	server.on('response', function (req, res, err, file, stat) {
	  // res.status is the response status sent to the client
	  // res.headers are the headers sent
	  // err is any error message thrown
	  // file the file being served (may be null)
	  // stat the stat of the file being served (is null if file is null)
	 
	  // NOTE: the response has already been sent at this point
	})*/

	return true
} //end init


module.exports={
	init: init
}