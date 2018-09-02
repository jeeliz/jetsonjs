const Fs = require('fs')
const StaticServer = require('node-static');//doc here: https://www.npmjs.com/package/node-static 
const Http = require('http')

//const Wrench = require('wrench')

/*const copy_file=(src, dst)=>{
	Fs.createReadStream(src).pipe(Fs.createWriteStream(dst))
}
const copy_dir=(src, dst)=>{
	Wrench.copyDirSyncRecursive(src, dst,{
		forceDelete: true, // Whether to overwrite existing directory or not
	    excludeHiddenUnix: true, // Whether to copy hidden Unix files or not (preceding .)
	    preserveFiles: false, // If we're overwriting something and the file already exists, keep the existing
	    preserveTimestamps: false, // Preserve the mtime and atime when copying files
	    inflateSymlinks: false, // Whether to follow symlinks or not when copying files
	    exclude: "readme*" // An exclude filter (either a regexp or a function)
	})
}
const create_dir=(dir)=>{
	if (!Fs.existsSync(dir)){
	    Fs.mkdirSync(dir);
	}
}*/

const init=(SETTINGS)=>{
	const rootPath='../'
	const fullAppPath=rootPath+SETTINGS.server.serviceAppHTTPPath
	//const fullAppAutoPath=fullAppPath+'auto/'

	//create the served auto path if not exists
	//create_dir(fullAppAutoPath)

	//copy settings.js to the served path
	//copy_file(rootPath+'settings.js', fullAppAutoPath+'settings.js')

	//copy JetsonJSclient to the served path
	//copy_file(rootPath+'client/JetsonJSClient.js', fullAppAutoPath+'JetsonJSClient.js')
	//copy_dir(rootPath+'client/libs', fullAppAutoPath+'/libs')




	//start the server :
	/*const server = new StaticServer({
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
	  console.log('INFO in AppHTTP.js - init() : HTTP static server listening to', server.port.toString())
	  console.log('OPEN http://127.0.0.1:'+server.port.toString()+' in your web browser')
	})*/
	 
	const serveApp = new StaticServer.Server(fullAppPath)
	const serveAutoRoot = new StaticServer.Server(rootPath)
	const serveAutoClient = new StaticServer.Server(rootPath+'client')


	Http.createServer(function (request, response) {
	    request.addListener('end', function () {
	        //
	        // Serve files!
	        //
	        
	        //console.log(request.url);
	        const requestSplitted=request.url.split('/')
	        requestSplitted.shift()
	        const baseDir=requestSplitted.shift()


	        //ROUTING:
	        if(baseDir==='auto'){
	        	request.url='/'+requestSplitted.join('/')
	        	const a=requestSplitted.shift()
	        	const b=requestSplitted.shift()

	        	//console.log('a=', a, 'b=',b, 'request.url=', request.url)

	        	if (a==='JetsonJSClient.js'){ //works (http://127.0.0.1:8080/auto/JetsonJSClient.js)
	        		serveAutoClient.serve(request, response)
	        	} else if(a==='settings.js'){ //works (http://127.0.0.1:8080/auto/settings.js)
	        		serveAutoRoot.serve(request, response)
	        	} else if(a==='libs'){ //works (http://127.0.0.1:8080/auto/libs/jquery/jquery-3.3.1.min.js)
	        		serveAutoClient.serve(request, response)
	        	} else {
	        		serveApp.serve(request, response)
	        	}
	        	
	        } else {
	        	serveApp.serve(request, response)
	        }
	    }).resume()

	}).listen(SETTINGS.server.serviceAppHTTPPort);

	console.log('INFO in AppHTTP.js - init() : HTTP static server listening to'+SETTINGS.server.serviceAppHTTPPort.toString())
	console.log('OPEN http://127.0.0.1:'+SETTINGS.server.serviceAppHTTPPort.toString()+' in your web browser')

	return true
} //end init


module.exports={
	init: init
}