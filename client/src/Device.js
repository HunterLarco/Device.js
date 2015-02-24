(function(){
	
	function APIPost(url, data, onresponse, onerror){
		function HandleResponse(request){
			var event = JSON.parse(request.response);
			if(event.stat != 'ok') onerror(event);
			else if(typeof onresponse == 'function') onresponse(event.data);
		}
		function HandlerError(request){
			if(typeof onerror == 'function') onerror({
				'stat': 'fail',
				'code': '-1',
				'message': 'Unknown Internal Error'
			});
		}
		Post(url, data, HandleResponse, HandlerError);
	}
	
	// onregister
	function UnregisteredDevice(){
		var self = this;
		
		var listeners = {};
		
		self.register = Register;
		
		self.addEventListener = AddEventListener;
		self.removeEventListener = RemoveEventListener;
		
		function AddEventListener(event_name, funct){
			event_name = 'on'+event_name;
			if(typeof funct != 'function') return;
			if(!listeners[event_name]) listeners[event_name] = [];
			if(listeners[event_name].indexOf(funct) > -1) return;
			listeners[event_name].push(funct);
		}
		function RemoveEventListener(event_name, funct){
			event_name = 'on'+event_name;
			if(!listeners[event_name]) return;
			listeners[event_name].splice(listeners[event_name].indexOf(funct), 1);
		}
		function TriggerEvent(event_name, event){
			event_name = 'on'+event_name;
			var listener_array = listeners[event_name];
			if(!listener_array) return;
			for(var i=0,listener; listener=listener_array[i++];)
				listener(event);
		}
		
		function Register(){
			var data = {'__method__': 'device.register'};
			APIPost('/device', data, CreateDevice, RegistrationError);
		}
		function CreateDevice(event){
			window.Device = new SourceDevice(
				event.identifier,
				event.channel
			);
			TriggerEvent('register', window.Device);
		}
		function RegistrationError(event){
			console.error('Device Registration Failed: Unknown Error')
		}
		
	}
	
	// onverify
	function ConnectedDevice(){
		var self = this;
		
		var identifier;
		var verified = false;
		var source, nickname;
		
		var listeners = {};
		
		self.send = Send;
		
		self.identifier = GetIdentifier;
		self.isverified = IsVerified;
		
		self.__ping__ = Ping;
		self.__verify__ = Verify;
		
		self.addEventListener = AddEventListener;
		self.removeEventListener = RemoveEventListener;
		
		function AddEventListener(event_name, funct){
			event_name = 'on'+event_name;
			if(typeof funct != 'function') return;
			if(!listeners[event_name]) listeners[event_name] = [];
			if(listeners[event_name].indexOf(funct) > -1) return;
			listeners[event_name].push(funct);
		}
		function RemoveEventListener(event_name, funct){
			event_name = 'on'+event_name;
			if(!listeners[event_name]) return;
			listeners[event_name].splice(listeners[event_name].indexOf(funct), 1);
		}
		function TriggerEvent(event_name, event){
			event_name = 'on'+event_name;
			var listener_array = listeners[event_name];
			if(!listener_array) return;
			for(var i=0,listener; listener=listener_array[i++];)
				listener(event);
		}
		
		function Verify(){
			verified = true;
			TriggerEvent('verify', self);
		}
		
		function Send(method, data, retry){
			data = !data ? {} : data;
			retry = !retry ? true : false;
			
			var retries = 0;
			PSend();
			
			function PSend(){
				APIPost('/device', {
					'__method__': 'device.send',
					'method': method,
					'data': data,
					'target': identifier,
					'source': source.identifier()
				}, null, Retry);
			}
			
			function Retry(){
				var seconds = Math.pow(2, retries++);
				console.info('API Error: Retrying in '+seconds+' seconds');
				setTimeout(PSend, seconds*1000);
			}
		}
		function Ping(){
			Send('device.connection.ping');
		}
		
		function GetIdentifier(){
			return identifier;
		}
		function IsVerified(){
			return verified;
		}
		
		(function Constructor(device_id, _source){
			identifier = device_id;
			source = _source;
		}).apply(this, arguments);
	}
	
	// onverify, onmessage
	function SourceDevice(){
		var self = this;
		
		var identifier;
		var channel, channel_token, socket;
		var connections = [];
		
		var listeners = {};
		
		self.connect = Connect;
		
		self.identifier = GetIdentifier;
		
		self.send = Send;
		
		self.devices = GetDevices;
		self.device = GetDevice;
		
		self.addEventListener = AddEventListener;
		self.removeEventListener = RemoveEventListener;
		
		function AddEventListener(event_name, funct){
			event_name = 'on'+event_name;
			if(typeof funct != 'function') return;
			if(!listeners[event_name]) listeners[event_name] = [];
			if(listeners[event_name].indexOf(funct) > -1) return;
			listeners[event_name].push(funct);
		}
		function RemoveEventListener(event_name, funct){
			event_name = 'on'+event_name;
			if(!listeners[event_name]) return;
			listeners[event_name].splice(listeners[event_name].indexOf(funct), 1);
		}
		function TriggerEvent(event_name, event){
			event_name = 'on'+event_name;
			var listener_array = listeners[event_name];
			if(!listener_array) return;
			for(var i=0,listener; listener=listener_array[i++];)
				listener(event);
		}
		
		function TriggerOnVerify(device){
			TriggerEvent('verify', {
				'source': self,
				'target': device
			});
		}
		
		function Send(){
			for(var i=0,device; device=connections[i++];)
				device.send.apply(device, arguments);
		}
		
		function GetDevices(){
			return connections;
		}
		function GetDevice(identifier){
			for(var i=0,dev; dev=connections[i++];)
				if(dev.identifier() == identifier)
					return dev;
			return null;
		}
		
		function GetIdentifier(){
			return identifier;
		}
				
		// methods of the form device\.(.*) are reserved
		function ChannelReceiver(message){
			var event = JSON.parse(message.data),
					method = event.method;
			if(event.method.split('.')[0] == 'device')
				switch(event.method){
					case 'device.connection.ping':
						ConnectionPing(event);
					break;
				}
			else TriggerEvent('message', event);
		}
		function OnUnexpectedDisconnect(){
			console.error('Unexpected Channel Disconnect');
		}
		
		function Connect(target_identifier, onverify){
			var device = new ConnectedDevice(target_identifier, self);
			device.addEventListener('verify', onverify);
			device.addEventListener('verify', TriggerOnVerify);
			connections.push(device);
			device.__ping__();
			return device;
		}
		function ConnectionPing(event){
			var device = GetDevice(event.source);
			if(!device) device = Connect(event.source);
			if(device.isverified()) return;
			device.__verify__();
		}
		
		function ConnectChannel(){
			channel = new goog.appengine.Channel(channel_token);
			socket = channel.open();
			socket.onmessage = ChannelReceiver;
			socket.onclose = OnUnexpectedDisconnect;
		}
		
		(function Constructor(_identifier, _channel){
			identifier = _identifier;
			channel_token = _channel;
			ConnectChannel();
		}).apply(this, arguments);
	}
	
	window.Device = new UnregisteredDevice();
	
})();