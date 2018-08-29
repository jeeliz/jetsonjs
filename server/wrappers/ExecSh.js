const { exec } = require('child_process')

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
   exec_cmd('/usr/bin/sudo '+shellCmd, callback)
}

//TEST sudoExec_cmd:
//you should have run sudo visudo and add this line: 
//<yourUser> ALL=(ALL) NOPASSWD: /usr/bin/whoami
/*console.log('TEST: ExecSh - sudoExec_cmd():')
sudoExec_cmd('sudo whoami', false)
//*/


module.exports={
	exec_cmd: exec_cmd,
	sudoExec_cmd: sudoExec_cmd
} 
