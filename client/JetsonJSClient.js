/*
	This script implements the JETSONJSCLIENT api
	It should run into a web browser (not nodejs)
	it will transmit the data from the app (sampleApp for example)
	to the nodeJS server part using websockets

	The second role of this script is to transmit the network configuration

	You should include ../settings.js before using this script

	spec :
	   callbackReady: function called when the JetsonJSClient is ready,
	   callbackConnect: function launched with true if there is at least 1 client connected at the final app, 0 otherwise
	   
	   keyboardTargetsClass: class of the <input> where the virtual keyboard should be displayed
	   keyboardAttachId: id of the area where the virtual keyboard should be attached

	   wifiConfigIds: list of DOM ids to bind the WIFI config widget. See sampleApp for more details

*/

"use strict";


const JETSONJSCLIENT=(function(){
	//privates vars :
	let _socket
	const _states={
		notLoaded: 0,
		loading: 1,
		idle: 2,
		busy: 3,
		error: 4,
		reloading: 5
	}
	let _state=_states.notLoaded
	let _callbackConnect, _isClientConnected=-1 //-1,0 or 1

	const _wifiConfig={
		state: -1,
		domElements: {
			divWidget: false,
			
			selectNetworks: false,
			inputUser: false,
			inputPassword: false,

			divConnected: false,
			divDisconnected: false,
			divIP: false,

			buttonValidate: false,
			buttonRefresh: false
		},
		vals: {
			user: false,
			password: false,
			network: false,
			IP: '-'
		},
		networks: []
	}
	const _wifiStates={
		noSet: -1,
		busy: 1,
		connected: 2,
		disconnected: 0
	}
	let _keyboard={
		isInitialized: false,
		jqAttach: null
	};

	//private methods :

	//BEGIN DOM UTILS
	function add_CSSClass(domElement, cssClass){
		if (domElement.className.indexOf(cssClass)!==-1){
			return;
		}
		domElement.className+=' '+cssClass;
	}

	function remove_CSSClass(domElement, cssClass){
		domElement.className=domElement.className.replace(cssClass, '');
	}

	function empty(domElement){
		domElement.innerHTML='';
	}

	function hide_element(domElement){
		if(!domElement){
			return;
		}
		domElement.style.display='none';
	}

	function show_element(domElement){
		if(!domElement){
			return;
		}
		domElement.style.display='block';
	}
	//END DOM UTILS

	//BEGIN COMMUNICATION WITH SERVER PART
	function send(typeLabel, msg){
		if(_socket.readyState!==WebSocket.OPEN){
			return false
		}
		_socket.send(JSON.stringify({
			t: typeLabel,
			m: msg
		}))
		return true
	}

	function reloadPageDelayed(event){
		if (_state===_states.reloading){
			return
		}
		_state=_states.reloading;
		console.log('WARNING in JetsonJSClient : reloadPageDelayed() launched !')
		setTimeout(reload_ifAlive, SETTINGS.client.reloadTimeout)
	}

	function reload_ifAlive(){
		ping(location.href, (isAlive)=>{
			if (isAlive){
				location.reload()
			} else {
				console.log('WARNING in JetsonJSClient : server is still down...')
				setTimeout(reload_ifAlive, SETTINGS.client.reloadTimeout)
			}
		})
	}

	function ping(url, callback){ //test if URL is alive with a XHR
		var xmlHttp = new XMLHttpRequest()
        xmlHttp.open("GET", url, true)
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
            	if (xmlHttp.status===200){
                	callback(true)  //is alive OK
            	} else {
            		callback(false)
            	}
            }
        };
        xmlHttp.send()
	}

	function process_receivedMessage(event){
		//console.log('INFO in JetsonJSClient.js : message received = ', event.data)
	    const dataParsed=JSON.parse(event.data);
	    const typeLabel=dataParsed.t;
	    const data=dataParsed.m;
	    switch(typeLabel){
	    	case 'CLIENTSCOUNT':
	    		const newClientsConnected=(data===0)?0:1
	    		if (newClientsConnected!==_isClientConnected){
	    			_isClientConnected=newClientsConnected
	    			if (_callbackConnect){
	    				_callbackConnect(_isClientConnected)
	    			}
	    		}
	    	break

	    	case 'WIFIINFO':
	    		console.log('INFO in JetsonJSClient.js : WIFIINFO received = ', data);
	    		_wifiConfig.state=(data.connected)?_wifiStates.connected:_wifiStates.disconnected;
	    		
	    		_wifiConfig.vals.network=data.network;
	    		_wifiConfig.vals.user=data.user;
				_wifiConfig.vals.password=data.password;
				_wifiConfig.vals.IP=data.IP;

				_wifiConfig.networks=data.networks;
				update_wifiUI();
	    	break
	    } //end switch(typelabel)
	} //end process_receivedMessage

	function connect_toWsServer(callback){
		_socket=new WebSocket('ws://127.0.0.1:'+SETTINGS.server.serviceAppWSPort)
		
		// Connection opened
		_socket.addEventListener('open', function (event) {
			console.log('INFO in JetsonJSClient.js : connected!')
		    send('STATUS', 'OPEN')
		    _state=_states.idle
		    if (callback){
		    	callback()
		    }
		})

		// Listen for messages
		_socket.addEventListener('message', process_receivedMessage)

		_socket.addEventListener('error', reloadPageDelayed)
		_socket.addEventListener('close', reloadPageDelayed)
	} //end connect_toWsServer()
	//END COMMUNICATION WITH SERVER PART

	//BEGIN WIFI CONFIGURATION
	function update_wifiConfig(event){
		console.log('INFO in JetsonJSClient.js : update_wifiConfig() launched');
		var update_val=function(valKey, domKey){
			var domElt=_wifiConfig.domElements[domKey];
			if (!domElt) return;
			_wifiConfig.vals[valKey]=domElt.value;
		}
		update_val('user', 'inputUser');
		update_val('password', 'inputPassword');
		update_val('network', 'selectNetworks');
		_wifiConfig.state=_wifiStates.busy;
		update_wifiUI();
		send('WIFICONFIG', _wifiConfig.vals);
	}

	function update_wifiNetworksList(){
		console.log('INFO in JetsonJSClient.js : update_wifiNetworksList() launched');
		send('WIFIINFOS', 0);
		_wifiConfig.state=_wifiStates.busy;
		update_wifiUI();
	}

	//update wifiUI from _wifiConfig
	function update_wifiUI(){
		if (_wifiConfig.domElements.inputUser){
			_wifiConfig.domElements.inputUser.value=_wifiConfig.vals.user;
		}
		if (_wifiConfig.domElements.inputPassword){
			_wifiConfig.domElements.inputPassword.value=_wifiConfig.vals.password;
		}
		if (_wifiConfig.domElements.selectNetworks){
			empty(_wifiConfig.domElements.selectNetworks);
			_wifiConfig.networks.forEach(function(network){
				var domOption=document.createElement('option');
				domOption.value=network;
				domOption.innerHTML=network;
				if (network===_wifiConfig.vals.network){
					domOption.setAttribute('selected', true);
				}
				_wifiConfig.domElements.selectNetworks.appendChild(domOption);
			});
		}
		if (_wifiConfig.domElements.divIP){
			_wifiConfig.domElements.divIP.innerHTML=_wifiConfig.vals.IP;
		}
		if (_wifiConfig.vals.IP){ //connected
			hide_element(_wifiConfig.domElements.divDisconnected);
			show_element(_wifiConfig.domElements.divConnected);
		} else { //disconnected
			show_element(_wifiConfig.domElements.divDisconnected);
			hide_element(_wifiConfig.domElements.divConnected);
		}
		if (_wifiConfig.domElements.divWidget){
			if (_wifiConfig.state===_wifiStates.busy){
				add_CSSClass(_wifiConfig.domElements.divWidget, 'wifiFrozen');
			} else {
				remove_CSSClass(_wifiConfig.domElements.divWidget, 'wifiFrozen');
			}
		}
	}
	//ENDWIFI CONFIGURATION

	//BEGIN VIRTUAL KEYBOARD
	function init_keyboard(domClassTargets, attachId){
		if (typeof($)==='undefined' || typeof($.keyboard)==='undefined'){
			console.log('WARNING in JetsonJSClient.js - init_keyboard() : no keyboard script included');
			return;
		}
		console.log('INFO in JetsonJSClient.js - init_keyboard()...');

		const jqTargets=$('.'+domClassTargets);
		jqTargets.each(function(jqElementIndex){
			const domElement=jqTargets[jqElementIndex];
			bind_keyboardToInput($(domElement));
		});

		_keyboard.jqAttach=(attachId)?$('#'+attachId):null;
		_keyboard.isInitialized=true;
	}


	function bind_keyboardToInput(jqInput){
		jqInput.keyboard({

		      // *** choose layout & positioning ***
		      // choose from 'qwerty', 'alpha',
		      // 'international', 'dvorak', 'num' or
		      // 'custom' (to use the customLayout below)
		      layout: 'qwerty',
		     /* customLayout: {
		        'default': [
		          'd e f a u l t',
		          '{meta1} {meta2} {accept} {cancel}'
		        ],
		        'meta1': [
		          'm y m e t a 1',
		          '{meta1} {meta2} {accept} {cancel}'
		        ],
		        'meta2': [
		          'M Y M E T A 2',
		          '{meta1} {meta2} {accept} {cancel}'
		        ]
		      },*/
		      // Used by jQuery UI position utility
		      position: {
		        // null = attach to input/textarea;
		        // use $(sel) to attach elsewhere
		        of: $('#virtualKeyboard'), //null,
		        my: 'center top',
		        at: 'center top',
		        // used when "usePreview" is false
		        //at2: 'center bottom'
		        //collision: 'fit'
		      },

		      // allow jQuery position utility to reposition the keyboard on
		      // window resize
		      reposition: false,//true,

		      // true: preview added above keyboard;
		      // false: original input/textarea used
		      usePreview: true,

		      // if true, the keyboard will always be visible
		      alwaysOpen: false,

		      // give the preview initial focus when the keyboard
		      // becomes visible
		      initialFocus: true,
		      // Avoid focusing the input the keyboard is attached to
		      noFocus: false,

		      // if true, keyboard will remain open even if
		      // the input loses focus.
		      stayOpen: false,

		      // Prevents the keyboard from closing when the user clicks or
		      // presses outside the keyboard. The `autoAccept` option must
		      // also be set to true when this option is true or changes are lost
		      userClosed: false,

		      // if true, keyboard will not close if you press escape.
		      ignoreEsc: false,

		      // *** change keyboard language & look ***
		      /*display: {
		        'meta1': '\u2666', // Diamond
		        'meta2': '\u2665', // Heart

		        // check mark (accept)
		        'a': '\u2714:Accept (Shift-Enter)',
		        'accept': 'Accept:Accept (Shift-Enter)',
		        'alt': 'AltGr:Alternate Graphemes',
		        // Left arrow (same as &larr;)
		        'b': '\u2190:Backspace',
		        'bksp': 'Bksp:Backspace',
		        // big X, close/cancel
		        'c': '\u2716:Cancel (Esc)',
		        'cancel': 'Cancel:Cancel (Esc)',
		        // clear num pad
		        'clear': 'C:Clear',
		        'combo': '\u00f6:Toggle Combo Keys',
		        // num pad decimal '.' (US) & ',' (EU)
		        'dec': '.:Decimal',
		        // down, then left arrow - enter symbol
		        'e': '\u21b5:Enter',
		        'empty': '\u00a0', // &nbsp;
		        'enter': 'Enter:Enter',
		        // left arrow (move caret)
		        'left': '\u2190',
		        // caps lock
		        'lock': '\u21ea Lock:Caps Lock',
		        'next': 'Next \u21e8',
		        'prev': '\u21e6 Prev',
		        // right arrow (move caret)
		        'right': '\u2192',
		        // thick hollow up arrow
		        's': '\u21e7:Shift',
		        'shift': 'Shift:Shift',
		        // +/- sign for num pad
		        'sign': '\u00b1:Change Sign',
		        'space': '\u00a0:Space',
		        // right arrow to bar
		        // \u21b9 is the true tab symbol
		        't': '\u21e5:Tab',
		        'tab': '\u21e5 Tab:Tab',
		        // replaced by an image
		        'toggle': ' ',

		        // added to titles of keys
		        // accept key status when acceptValid:true
		        'valid': 'valid',
		        'invalid': 'invalid',
		        // combo key states
		        'active': 'active',
		        'disabled': 'disabled'

		      },*/

		      // Message added to the key title while hovering,
		      // if the mousewheel plugin exists
		      wheelMessage: 'Use mousewheel to see other keys',

		      css: {
		        // input & preview
		        input: 'ui-widget-content ui-corner-all',
		        // keyboard container
		        container: 'ui-widget-content ui-widget ui-corner-all ui-helper-clearfix',
		        // keyboard container extra class (same as container, but separate)
		        popup: '',
		        // default state
		        buttonDefault: 'ui-state-default ui-corner-all',
		        // hovered button
		        buttonHover: 'ui-state-hover',
		        // Action keys (e.g. Accept, Cancel, Tab, etc);
		        // this replaces "actionClass" option
		        buttonAction: 'ui-state-active',
		        // Active keys
		        // (e.g. shift down, meta keyset active, combo keys active)
		        buttonActive: 'ui-state-active',
		        // used when disabling the decimal button {dec}
		        // when a decimal exists in the input area
		        buttonDisabled: 'ui-state-disabled',
		        // {empty} button class name
		        buttonEmpty: 'ui-keyboard-empty'
		      },

		      // *** Useability ***
		      // Auto-accept content when clicking outside the
		      // keyboard (popup will close)
		      autoAccept: false,
		      // Auto-accept content even if the user presses escape
		      // (only works if `autoAccept` is `true`)
		      autoAcceptOnEsc: false,

		      // Prevents direct input in the preview window when true
		      lockInput: false,

		      // Prevent keys not in the displayed keyboard from being
		      // typed in
		      restrictInput: false,
		      // Additional allowed characters while restrictInput is true
		      restrictInclude: '', // e.g. 'a b foo \ud83d\ude38'

		      // Check input against validate function, if valid the
		      // accept button is clickable; if invalid, the accept
		      // button is disabled.
		      acceptValid: true,
		      // Auto-accept when input is valid; requires `acceptValid`
		      // set `true` & validate callback
		      autoAcceptOnValid: false,

		      // if acceptValid is true & the validate function returns
		      // a false, this option will cancel a keyboard close only
		      // after the accept button is pressed
		      cancelClose: true,

		      // tab to go to next, shift-tab for previous
		      // (default behavior)
		      tabNavigation: false,

		      // enter for next input; shift-enter accepts content &
		      // goes to next shift + "enterMod" + enter ("enterMod"
		      // is the alt as set below) will accept content and go
		      // to previous in a textarea
		      enterNavigation: false,
		      // mod key options: 'ctrlKey', 'shiftKey', 'altKey',
		      // 'metaKey' (MAC only)
		      // alt-enter to go to previous;
		      // shift-alt-enter to accept & go to previous
		      enterMod: 'altKey',

		      // if true, the next button will stop on the last
		      // keyboard input/textarea; prev button stops at first
		      // if false, the next button will wrap to target the
		      // first input/textarea; prev will go to the last
		      stopAtEnd: true,

		      // Set this to append the keyboard immediately after the
		      // input/textarea it is attached to. This option works
		      // best when the input container doesn't have a set width
		      // and when the "tabNavigation" option is true
		      appendLocally: false,
		      // When appendLocally is false, the keyboard will be appended
		      // to this object
		      appendTo: 'body',

		      // If false, the shift key will remain active until the
		      // next key is (mouse) clicked on; if true it will stay
		      // active until pressed again
		      stickyShift: true,

		      // Prevent pasting content into the area
		      preventPaste: false,

		      // caret places at the end of any text
		      caretToEnd: false,

		      // caret stays this many pixels from the edge of the input
		      // while scrolling left/right; use "c" or "center" to center
		      // the caret while scrolling
		      scrollAdjustment: 10,

		      // Set the max number of characters allowed in the input,
		      // setting it to false disables this option
		      maxLength: false,
		      // allow inserting characters @ caret when maxLength is set
		      maxInsert: true,

		      // Mouse repeat delay - when clicking/touching a virtual
		      // keyboard key, after this delay the key will start
		      // repeating
		      repeatDelay: 500,

		      // Mouse repeat rate - after the repeatDelay, this is the
		      // rate (characters per second) at which the key is
		      // repeated. Added to simulate holding down a real keyboard
		      // key and having it repeat. I haven't calculated the upper
		      // limit of this rate, but it is limited to how fast the
		      // javascript can process the keys. And for me, in Firefox,
		      // it's around 20.
		      repeatRate: 20,

		      // resets the keyboard to the default keyset when visible
		      resetDefault: false,

		      // Event (namespaced) on the input to reveal the keyboard.
		      // To disable it, just set it to ''.
		      openOn: 'focus',

		      // Event (namepaced) for when the character is added to the
		      // input (clicking on the keyboard)
		      keyBinding: 'mousedown touchstart',

		      // enable/disable mousewheel functionality
		      // enabling still depends on the mousewheel plugin
		      useWheel: true,

		      // combos (emulate dead keys)
		      // if user inputs `a the script converts it to à,
		      // ^o becomes ô, etc.
		      useCombos: true,
		      // if you add a new combo, you will need to update the
		      // regex below
		      combos: {
		        // uncomment out the next line, then read the Combos
		        //Regex section below
		        '<': { 3: '\u2665' }, // turn <3 into ♥ - change regex below
		        'a': { e: "\u00e6" }, // ae ligature
		        'A': { E: "\u00c6" },
		        'o': { e: "\u0153" }, // oe ligature
		        'O': { E: "\u0152" }
		      },

		      // *** Methods ***
		      // Callbacks - attach a function to any of these
		      // callbacks as desired
		      initialized: function(e, keyboard, el) {},
		      beforeVisible: function(e, keyboard, el) {},
		      visible: function(e, keyboard, el) {},
		      beforeInsert: function(e, keyboard, el, textToAdd) { return textToAdd; },
		      change: function(e, keyboard, el) {},
		      beforeClose: function(e, keyboard, el, accepted) {},
		      accepted: function(e, keyboard, el) {},
		      canceled: function(e, keyboard, el) {},
		      restricted: function(e, keyboard, el) {},
		      hidden: function(e, keyboard, el) {},

		      // called instead of base.switchInput
		      // Go to next or prev inputs
		      // goToNext = true, then go to next input;
		      //   if false go to prev
		      // isAccepted is from autoAccept option or
		      //   true if user presses shift-enter
		      switchInput: function(keyboard, goToNext, isAccepted) {},

		      // this callback is called just before the "beforeClose"
		      // to check the value if the value is valid, return true
		      // and the keyboard will continue as it should (close if
		      // not always open, etc)
		      // if the value is not value, return false and the clear
		      // the keyboard value ( like this
		      // "keyboard.$preview.val('');" ), if desired
		      validate: function(keyboard, value, isClosing) {
		        return true;
		      }

		})
		//_keyboard.kb=_keyboard.jq.getkeyboard();
		//_keyboard.kb.reveal();
		//_keyboard.kb.close();
	} //end bind_keyboardToInput()

	//END VIRTUAL KEYBOARD

	function fix_selectBoxElectron(){
		//if (!$) return;
		$('select').each(function(ind, domElt){
			const jqSelect=$(domElt);
			jqSelect.selectmenu();
			
			//window.plapp=jqSelect;
			setTimeout(jqSelect.selectmenu.bind(jqSelect, 'refresh'), 2000);
		});


	}

	//public methods :
	const that={
		'init': function(spec){ //entry point
			_state=_states.loading;
			_callbackConnect=spec.callbackConnect;
			connect_toWsServer(spec.callbackReady);

			if (spec.keyboardTargetsClass){
				$.when(
				    $.getScript( "auto/libs/MottieKeyboard/js/jquery.keyboard.min.js" ),
				    $.getScript( "auto/libs/MottieKeyboard/js/jquery.keyboard.extension-all.min.js" ),
				    $.Deferred(function( deferred ){
				        $( deferred.resolve );
				    })
				).done(function(){
					init_keyboard(spec.keyboardTargetsClass, spec.keyboardAttachId);
				}) //end success keyboard.min.js
			}

			if (spec.wifiConfigIds){
				console.log('INFO in JetsonJSClient.js - init() : a Wifi config is provided');
				Object.keys(_wifiConfig.domElements).forEach(function(domKey){
					var domId=spec.wifiConfigIds[domKey];
					var domElt=document.getElementById(domId);
					if (!domElt){
						console.log('WARNING in JetsonJSClient.js - init() : cannot found an input element which id =', domId, 'in the DOM');
						return
					}
					_wifiConfig.domElements[domKey]=domElt;
				});

				if (_wifiConfig.domElements.buttonValidate){
					_wifiConfig.domElements.buttonValidate.addEventListener('click', update_wifiConfig, false);
				}
				if (_wifiConfig.domElements.buttonRefresh){
					_wifiConfig.domElements.buttonRefresh.addEventListener('click', update_wifiNetworksList, false);
				}

				setTimeout(that['fetch_wifi'], 100);
			}
		},	

		'send_value': function(dict){
			if (_state!==_states.idle){
				return
			}
			if (!send('VAL', dict)){
				console.log('ERROR in JetsonJSClient.js - send_value : the websocket is not in OPEN state. _socket.readyState =', _socket.readyState);
				_state=_states.error
				reloadPageDelayed()
			}
		},

		'exec_shellCmd': function(cmd){
			if (_state!==_states.idle){
				return false
			}
			return send('SHELLCMD', cmd)
		},

		'shutdown': function(){
			console.log('INFO in JetsonJSClient.js: shutdown() launched. THE DEVICE WILL SHUTDOWN BRO!!!');
			send('CMD', 'SHUTDOWN')
		},

		'fetch_wifi': function(){
			update_wifiNetworksList();
		},

		'close': function(){
			try{
				window.close();
				window.top.close();
			} catch(e){
				console.log('WARNING in JetsonJSClient.js - close(): cannot simply close the window');
			}

			try {
				const electronRemote = require('electron').remote;
				var electronWin = electronRemote.getCurrentWindow();
				electronWin.close();
			} catch(e){
				console.log('WARNING in JetsonJSClient.js - close(): Electron is not here or the app was not launched with Electron');
			}
		},

		'open_electronDevTools': function(){
			try{
				const electronRemote = require('electron').remote;
				var electronWin = electronRemote.getCurrentWindow();
				electronWin.toggleDevTools();
			} catch(e){
				console.log('WARNING in JetsonJSClient.js - open_electronDevTools(): Cannot open devTools. Maybe not executed through Electron?');
			}
		},

		'set_GPIO': function(nb, val){
			send('GPIO',{
				'number': nb,
				'val': val
			})
		},

		'is_inElectron': function(){
			try{
				return (window && window.process && window.process.type)?true:false;
			} catch(e){
				return false;
			}
		},

		'fix_electron': function(){
			if (!that['is_inElectron']()){
				//setTimeout(fix_selectBoxElectron, 500);
				return;
			}
			window.$ = window.jQuery = require('jquery');
			//require('jquery-ui'); -> not working cf https://stackoverflow.com/questions/34485506/jquery-ui-and-electron
			$(document).ready(fix_selectBoxElectron);
		}

	} //end that
	return that
})() //end closure
