const exec_cmd=(shellCmd, callback)=>{
	exec(shellCmd, (err, stdout, stderr) => {
	  if (err) {
	  	console.log('WARNING in AppWS - exec_cmd(): cannot execute the command ', shellCmd, 'err =', err)
	  	if (callback){
	  		callback(false, '', '')
	  	}
	    return
	  }

	  // the *entire* stdout and stderr (buffered)
	  console.log('INFO in AppWS - exec_cmd(): ', shellCmd, 'results:')
	  console.log(`stdout: ${stdout}`)
	  console.log(`stderr: ${stderr}`)
	  if (callback){
	  	callback(true, stdout, stderr)
	  }
	})
} 


module.exports={
	exec_cmd: exec_cmd
} 