#Device.js Documentation

Contributers&ensp;·&ensp;[Hunter Larco](http://larcolabs.com)

## Example

```javascript
Device.register();
Device.connect('dev1');
Device.connect('dev2');

Device.device('dev1').send('hello.world', {message:'Hello'});
Device.device('dev2').send('goodbye.world', {message:'Goodbye'});
Device.send('mass.world', {message:'Hello Everybody!'});

Device.addEventListener('message', OnMessage);

function OnMessage(event){
	console.log('Message Received from ' + event.source.identifier());
	console.log('Method is ' + event.method);
	console.log('Data is ', event.data);
}
```

## Methods

* UnregisteredDevice
	* `Device.register` ~ Requests a device identifier from the server, these identifiers are used to distinguish devices from each other and initiate connections. Upon registration the global Device object is changed from an UnregisteredDevice to a SourceDevice.
	* `Device.addEventListener(name, funct)`
	* `Device.removeEventListener(name, funct)`
	  * Events
		  * onregister
* SourceDevice
	* `Device.identifier()` ~ Returns the idenfitier of the device
	* `Device.connect(identifier)` ~ Pings a target device to establish a connection. Returns a ConnectedDevice instance.
	* `Device.devices()` ~ Returns an array of all the ConnectedDevice instances created in the current browser session, regardless of whether the connection ping was accepted.
	* `Device.device(identifier)` ~ Returns the ConnectedDevice instance matching the given identifier, null if none exists.
	* `Device.send(method, data, retry)` ~ Sends the provided data and method name (any JSON serializable object) to all connected devices. If retry is true any failed sending attempts will periodically reattempt to send the data.
	* `Device.addEventListener(name, funct)`
	* `Device.removeEventListener(name, funct)`
	  * Events
			* onverify ~ signifies an accepted connection and response ping from another device. The event contains the source and target device instances.
			* onmessage ~ The event contains the source device instance (ConnectedDevice), message method, and message data.
* ConnectedDevice
	* `.identifier()` ~ Returns the idenfitier of the device
	* `.isverified()` ~ Returns true if a ping has been accepted by the device, indicating that it was online when first connected to.
	* `.send(method, data, retry)` ~ Sends the provided data and method name (any JSON serializable object) to this specific device. If retry is true any failed sending attempts will periodically reattempt to send the data.
	* `.addEventListener(name, funct)`
	* `.removeEventListener(name, funct)`
	  * Events
		  * onverify ~ signifies an accepted connection and response ping from another device. The event contains the source and target device instances.