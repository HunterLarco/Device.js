""" SYSTEM IMPORTS """
from google.appengine.api import channel


""" LOCAL IMPORTS """
import response


"""
' PURPOSE
'   Generates a unique identifier used to distinguish
'   connected devices.
' PARAMETERS
'   None
' RETURNS
'   <str identifier>
"""
def generate_device_id():
  from google.appengine.ext import ndb
  identifier = int(ndb.Model.allocate_ids(size=1)[0])
  from shortener import encode
  return encode(identifier)


"""
' PURPOSE
'   Sends the given data, method, and source device identifier
'   to the device with the target identifier via channel api.
' PARAMETERS
'   <str target> Identifier of target device
'   <str source> Identifier of source (sending) device
'   <str method> Desired task label for target device
'   <dict data>  Package data for target device
' RETURNS
'   Nothing
' NOTES
'   1. The 'method' variable is used to distinguish between
'      data instructions for the target device. For example,
'      one may use 'game_start' when a game starts while sending,
'      player data and then later 'player_update' to send when a
'      player's position changes while sending x, y coordinates through
'      the data variable.s
"""
def send(target, source, method, data={}):
  channel.send_message(target, response.compile({
    'method': method,
    'source': source,
    'data': data
  }))


"""
' PURPOSE
'   Registers a new device by creating a socket token and unique
'   device identifier.
' PARAMETERS
'   None
' RETURNS
'   A dict containing the...
'     <str identifier> *see generate_device_id*
'     <str channel_token> Used by the clientside Channel API JS
'                         to create a socket connection.
"""
def register():
  identifier = generate_device_id()
  channel_token = channel.create_channel(identifier)
  
  return {
    'identifier': identifier,
    'channel': channel_token
  }
