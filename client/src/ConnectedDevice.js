(function(){
  
  /*
   * PURPOSE
   *    A ConnectedDevice is a device created by the 'connect' method on
   *    a SourceDevice. This is a foreign device connected via the Channel API.
   *    It is important to note that a ConnectedDevice isn't necessarily
   *    connected. While the SourceDevice will ping the ConnectedDevice, until
   *    a ping is received the ConnectedDevice will remain unverified.
   * EVENTS
   *    onverify
  */
  function ConnectedDevice(){
    var self = this;
    
		
    var identifier;
    var verified = false;
    var source;
		
    var listeners = {};
    
		
    self.send = Send;
		
    self.identifier = GetIdentifier;
    self.isverified = IsVerified;
		
    // private
    self.__ping__ = Ping;
    self.__verify__ = Verify;
		
    self.addEventListener = AddEventListener;
    self.removeEventListener = RemoveEventListener;
		
    
    /*
     * PURPOSE
     *    Places an event listener using the given event_name
     *    and funct such that when the event_name event is triggered,
     *    funct will be called.
     * PARAMETERS
     *    <string event_name>
     *    <function funct(event)>
     * RETURNS
     *    Nothing
     * NOTES
     *    1. If AddEventListener is called multiple times each funct
     *       will be added and then called in the same order as added
     *       when the event is triggered. A function cannot be added twice.
     *       Adding a function twice will silently fail.
    */
    function AddEventListener(event_name, funct){
      event_name = 'on'+event_name;
      if(typeof funct != 'function') return;
      if(!listeners[event_name]) listeners[event_name] = [];
      if(listeners[event_name].indexOf(funct) > -1) return;
      listeners[event_name].push(funct);
    }
  
    /*
     * PURPOSE
     *    Removes an event listener given an event name and function.
     * PARAMETERS
     *    <string event_name>
     *    <function funct>
     * RETURNS
     *    Nothing
     * NOTES
     *    1. A function is provided so that, the single provided function
     *       is removed and not all functions associated with the provided
     *       event name.
    */
    function RemoveEventListener(event_name, funct){
      event_name = 'on'+event_name;
      if(!listeners[event_name]) return;
      listeners[event_name].splice(listeners[event_name].indexOf(funct), 1);
    }
  
    /*
     * PURPOSE
     *    Given and event name and event data, call every event listener
     *    corresponding to the given event name.
     * PARAMETERS
     *    <string event_name>
     *    <object event>
     * RETURNS
     *    Nothing
    */
    function TriggerEvent(event_name, event){
      event_name = 'on'+event_name;
      var listener_array = listeners[event_name];
      if(!listener_array) return;
      for(var i=0,listener; listener=listener_array[i++];)
        listener(event);
    }
    
		
    /*
     * PURPOSE
     *    Private method that marks this device as verified.
     *    Used by the SourceDevice.
     * PARAMETERS
     *    None
     * RETURNS
     *    Nothing
    */
    function Verify(){
      verified = true;
      TriggerEvent('verify', self);
    }
		
    /*
     * PURPOSE
     *    Sends data to this specific device over the Channel API.
     * PARAMETERS
     *    <string method>
     *    <object data> JSON serializable
     *    <boolean retry> Whether or not to retry failed requests
     * RETURNS
     *    Nothing
    */
    // TODO reserve device.(.*) methods
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
        if(!retry){
          console.warn('API Error. Request Failed.');
          return;
        }
        
        var seconds = Math.pow(2, retries++);
        console.info('API Error: Retrying in '+seconds+' seconds');
        
        setTimeout(PrivateSend, seconds*1000);
      }
    }
    
    /*
     * PURPOSE
     *    Private method that sends a ping request to the server.
     *    The response is watched by the SourceDevice in order
     *    to verify that this device is connected.
     * PARAMETERS
     *    None
     * RETURNS
     *    Nothing
    */
    function Ping(){
      Send('device.connection.ping');
    }
		
    /* GETTERS */
    function GetIdentifier(){
      return identifier;
    }
    function IsVerified(){
      return verified;
    }
		
    /*
     * PURPOSE
     *    ConnectedDevice constructor
     * PARAMETERS
     *    <string device_id>
     *    <SourceDevice source>
     * RETURNS
     *    <ConnectedDevice device>
    */
    (function Constructor(device_id, _source){
      identifier = device_id;
      source = _source;
    }).apply(this, arguments);
  }
  
  window.ConnectedDevice = ConnectedDevice;
  
})();