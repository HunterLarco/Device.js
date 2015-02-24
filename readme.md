#Device.js

Contributers&ensp;·&ensp;[Hunter Larco](http://larcolabs.com)

> Device.js provides an easier alternative to appengine's channel api. Piggybacking on the channel api, Device.js provides a framework for connecting and sending data between devices with only a few lines of code. It mediates routing data, formatting data, and socket event handlers, bundling it all into a single easy-to-use class.

## Example

```javascript
Device.register();
Device.connect('Mobile Device');
Device.send('hello.world', {
  content: "We're Sending Live Data!"
});

Device.addEventListener('message', OnMessage);
```

## Important Links
* [Installation Guide](./documentation/install.md)
* [Device.js Documentation](./documentation/client.md)
