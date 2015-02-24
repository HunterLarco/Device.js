#Installation

Contributers&ensp;·&ensp;[Hunter Larco](http://larcolabs.com)

> Installation requires two parts, a server install and client install.

## Server Install

1. Install [Google Appengine Python SDK](https://cloud.google.com/appengine/downloads)
2. Copy [the device folder](../server/build/device) into the root of your GAE project
3. Add the tuple `device.Hook` to your `WSGIApplication`. An example is below

```python
import device

app = webapp2.WSGIApplication([
  device.Hook,
  ('/.*', MainHandler)
], debug=True)
```

> Nice job! You're all set. Now you need to install the client device.js file

## Client Install

1. Copy [device.js](../client/build/device.min.js) into your project
2. Add it as well as the [channel api](https://cloud.google.com/appengine/docs/python/channel/) client script into your html. An example is below.

```html
<script type='text/javascript' src='./device.min.js'></script>
<script type='text/javascript' src='/_ah/channel/jsapi'></script>
```

> Congrats! You're all finished! Happy coding. Check out the [Device.js Docs](./client.md) if you need help getting started.