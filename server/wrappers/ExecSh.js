const { exec } = require('child_process')
const sudo = require('sudo-js')
sudo.setPassword('')

const exec_cmd=(shellCmd, callback)=>{
	exec(shellCmd, (err, stdout, stderr) => {
	  if (err) {
	  	console.log('WARNING in ExecSh - exec_cmd(): cannot execute the command ', shellCmd, 'err =', err)
	  	if (callback){
	  		callback(false, '', '')
	  	}
	    return
	  }

	  // the *entire* stdout and stderr (buffered)
	  console.log('INFO in ExecSh - exec_cmd(): ', shellCmd, 'results:')
	  console.log(`stdout: ${stdout}`)
	  console.log(`stderr: ${stderr}`)
	  if (callback){
	  	callback(true, stdout, stderr)
	  }
	})
} 

const sudoExec_cmd=(shellCmd, callback) =>{
    sudo.exec(shellCmd.split(' '), (err, pid, result) => {
        console.log('INFO in ExecSh - sudoExec_cmd(): ',result)
	if (callback){
            callback()
	}
    })
}

module.exports={
	exec_cmd: exec_cmd,
	sudoExec_cmd: sudoExec_cmd
} 
