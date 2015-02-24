from google.appengine.api import channel

import response


def generate_device_id():
  from google.appengine.ext import ndb
  identifier = int(ndb.Model.allocate_ids(size=1)[0])
  from shortener import encode
  return encode(identifier)


def send(target, source, method, data={}):
  channel.send_message(target, response.compile({
    'method': method,
    'source': source,
    'data': data
  }))


def register(nickname=None):
  identifier = generate_device_id()
  channel_token = channel.create_channel(identifier)
  
  return {
    'identifier': identifier,
    'channel': channel_token
  }