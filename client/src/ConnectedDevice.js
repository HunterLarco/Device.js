(function(){
  
  // EVENTS: onverify
  function ConnectedDevice(){
    var self = this;
		
    var identifier;
    var verified = false;
    var source, nickname;
		
    var listeners = {};
		
    self.send = Send;
		
    self.identifier = GetIdentifier;
    self.isverified = IsVerified;
		
    // private
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
      PrivateSend();
			
      function PrivateSend(){
        API.post('/device', {
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
        
        setTimeout(PrivateSend, seconds*1000);
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
  
  window.ConnectedDevice = ConnectedDevice;
  
})();