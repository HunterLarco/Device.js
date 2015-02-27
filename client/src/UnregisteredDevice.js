(function(){
  
  // EVENTS: onregister
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
      API.post('/device', data, CreateDevice, RegistrationError);
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
  
  window.UnregisteredDevice = UnregisteredDevice;
  
})();