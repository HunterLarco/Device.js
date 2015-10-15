(function(){
  
  // EVENTS: onverify, onmessage
  /*
   * PURPOSE
   *    A SourceDevice allows connections to ConnectedDevices and is
   *    necessary for all DeviceJS transactions.
   * EVENTS
   *    onverify(obj{<SourceDevice source>, <ConnectedDevice device>})
   *    onmessage(obj{<string method>, <string source>, <obj data>})
  */
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
     *    Used internally to trigger the 'onverify' event while also
     *    passing along the device that was just verified.
     * PARAMETERS
     *    <ConnectedDevice device>
     * RETURNS
     *    Nothing
    */
    function TriggerOnVerify(device){
      TriggerEvent('verify', {
        'source': self,
        'target': device
      });
    }
		
    /*
     * PURPOSE
     *    Applies the given arguments to every ConnectedDevice. This makes
     *    it easy to send a message to every device at once. See 'ConnectedDevice.send'
     *    for argument details.
     * PARAMETERS
     *    *See 'ConnectedDevice.send'*
     * RETURNS
     *    Nothing
    */
    function Send(){
      for(var i=0,device; device=connections[i++];)
        device.send.apply(device, arguments);
    }
		
    /*
     * PURPOSE
     *    Returns all ConnectedDevices.
     * PARAMETERS
     *    None
     * RETURNS
     *    An array of ConnectedDevice
     *    [ConnectedDevices, ...]
    */
    function GetDevices(){
      return connections;
    }
    
    /*
     * PURPOSE
     *    Retrieves a ConnectedDevice by its identifier. Useful when
     *    sending a message to one device by identifier.
     * PARAMETERS
     *    <string identifier>
     * RETURNS
     *    ConnectedDevice or null if device doesn't exist
    */
    function GetDevice(identifier){
      for(var i=0,dev; dev=connections[i++];)
        if(dev.identifier() == identifier)
          return dev;
      return null;
    }
		
    /* GETTER */
    function GetIdentifier(){
      return identifier;
    }
				
    /*
     * PURPOSE
     *    Receives data from the channel API, ultimated using the data
     *    to trigger the 'onmessage' event.
     * PARAMETERS
     *    <string message> JSON data in string
     * RETURNS
     *    Nothing
    */
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
    
    /*
     * PURPOSE
     *    Logs unexpected channel API disconnects
     * PARAMETERS
     *    None
     * RETURNS
     *    Nothing
    */
    function OnUnexpectedDisconnect(){
      console.error('Unexpected Channel Disconnect');
    }
		
    /*
     * PURPOSE
     *    Adds a new ConnectedDevice using the given identifier.
     * PARAMETERS
     *    <string target_identifier>
     *    <function onverify>
     * RETURNS
     *    <ConnectedDevice device>
    */
    // TODO add sent messages to unverified ConnectedDevice to a queue
    //      to send once verified.
    function Connect(target_identifier, onverify){
      var device = new ConnectedDevice(target_identifier, self);
      device.addEventListener('verify', onverify);
      device.addEventListener('verify', TriggerOnVerify);
      connections.push(device);
      device.__ping__();
      // TODO ping later if this ping fails
      return device;
    }
    
    /*
     * PURPOSE
     *    When a ConnectedDevice is created, the device that started the connection
     *    sends the new device a ping. Once received, this function registers the ping
     *    and realizes that no ConnectedDevice has the incoming ping's identifier. Thus
     *    it creates a new ConnectedDevice which in turn sends a ping to the original device
     *    which realizes that the devices already exists but is unverified. Thus that device
     *    is now verified. Because of this transaction both devices are verified. AKA...
     *    A connects to B pings B thus B connects to A pings A. Both A and B receive pings.
     * PARAMETERS
     *    <object event> 'onmessage' event data
     * RETURNS
     *    Nothing
    */
    function ConnectionPing(event){
      var device = GetDevice(event.source);
      if(!device) device = Connect(event.source);
      if(device.isverified()) return;
      device.__verify__();
    }
		
    /*
     * PURPOSE
     *    Opens the Channel API's socket.
     * PARAMETERS
     *    None
     * RETURNS
     *    Nothing
    */
    function ConnectChannel(){
      channel = new goog.appengine.Channel(channel_token);
      socket = channel.open();
      socket.onmessage = ChannelReceiver;
      socket.onclose = OnUnexpectedDisconnect;
    }
		
    /*
     * PURPOSE
     *    SourceDevice constructor
     * PARAMETERS
     *    <string registered_identifier> Comes from UnregisteredDevice
     *    <string channel_token> Comes from UnregisteredDevice
     * RETURNS
     *    <SourceDevice device>
    */
    (function Constructor(_identifier, _channel){
      identifier = _identifier;
      channel_token = _channel;
      ConnectChannel();
    }).apply(this, arguments);
  }
  
  window.SourceDevice = SourceDevice;
  
})();