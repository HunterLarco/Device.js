/*
 * PURPOSE
 *    An UnregisteredDevice contains the functions to register a device
 *    in order to begin transacting data.
 * EVENTS
 *    onregister
*/
(function(){
  
  // EVENTS: onregister
  function UnregisteredDevice(){
    var self = this;
		
    
    var listeners = {};
		
    
    self.register = Register;
		
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
     *    Registers a device. AKA converts a window.Device from a
     *    UnregisteredDevice into a SourceDevice. This is necessary to
     *    send or receive data.
     * PARAMETERS
     *    None
     * RETURNS
     *    Nothing
     * NOTES
     *    1. This is an async method. Results are not instantly available.
    */
    function Register(){
      var data = {'__method__': 'device.register'};
      API.post('/device', data, CreateDevice, RegistrationError);
    }
    
    /*
     * PURPOSE
     *    Callback function for the 'Register' function. Actually creates
     *    the new SourceDevice instance and calls the 'onregister' event.
     * PARAMETERS
     *    <object event> From API.post
     * RETURNS
     *    Nothing
     * NOTES
     *    1. Changes the value of window.Device
    */
    function CreateDevice(event){
      window.Device = new SourceDevice(
        event.identifier,
        event.channel
      );
      TriggerEvent('register', window.Device);
    }
    
    /*
     * PURPOSE
     *    Logs a Registration error.
     * PARAMETERS
     *    Nonte
     * RETURNS
     *    Nothing
    */
    function RegistrationError(event){
      console.error('Device Registration Failed: Unknown Error')
    }
  }
  
  
  window.UnregisteredDevice = UnregisteredDevice;
  
})();