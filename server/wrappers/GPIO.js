const EXECSH=require('./ExecSh')

//inspired from: https://devtalk.nvidia.com/default/topic/1020887/jetson-tx2/how-to-configure-a-gpio-on-tx2-/
const set=(nb, val)=>{
	const val01=(val)?'1':'0'
	EXECSH.exec_cmd('sudo setGPIO.sh '+nb.toString()+' '+val01)
}

module.exports={
	set: set
} 
