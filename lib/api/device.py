from google.appengine.ext import ndb
from google.appengine.api import channel

import response


class Device(ndb.Model):
  nickname = ndb.StringProperty(indexed=False)
  
  def identifier(self):
    from shortener import encode
    return encode(self.key.id())
  
  @classmethod
  def get_by_identifier(cls, identifier):
    from shortener import decode
    try:
      return cls.get_by_id(decode(identifier))
    except:
      return None


def info(identifier):
  dev = Device.get_by_identifier(identifier)
  if dev == None:
    return response.throw('100', data_struct=identifier)
  return {
    'nickname': dev.nickname
  }


def send(target, source, method, data={}):
  channel.send_message(target, response.compile({
    'method': method,
    'source': source,
    'data': data
  }))


def register(nickname=None):
  dev = Device()
  dev.nickname = str(nickname)
  dev.put()
  
  channel_token = channel.create_channel(dev.identifier())
  
  return {
    'nickname': nickname,
    'identifier': dev.identifier(),
    'channel': channel_token
  }