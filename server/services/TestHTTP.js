const StaticServer = require('static-server') //see https://www.npmjs.com/package/static-server for doc


const init=(SETTINGS)=>{
	if (SETTINGS.server.serviceTestHTTPPort===0){
		console.log('INFO : Test HTTP service is disabled')
		return false
	}

	//start the server :
	const server = new StaticServer({
	  rootPath: '../test',            // required, the root of the server file tree
	  port: SETTINGS.server.serviceTestHTTPPort,               // required, the port to listen
	  name: 'Test static http',   // optional, will set "X-Powered-by" HTTP header
	})
	 
	server.start(function () {
	  console.log('INFO in TestHTTP.js - init() : HTTP static server listening to', server.port)
	})
	 
	return true
} //end init


module.exports={
	init: init
}