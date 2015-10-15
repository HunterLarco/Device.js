__all__ = ['response', 'device', 'shortener']


""" LOCAL IMPORTS """
import response
import device
import shortener


""" GLOBAL IMPORTS """
import webapp2
from json import loads, dumps


# 000-003
"""
' PURPOSE
'   Receives post requests from the client JS library and then
'   handles the accordingly. AKA the connection between the server
'   functions and the client JS.
' NOTES
'   May throw errors 000-003 *see response.py*
"""
class HookHandler(webapp2.RequestHandler):
  
  """
  ' PURPOSE
  '   Writes the correct success syntax to the request body
  '   including the provided data dict.
  ' PARAMETERS
  '   <dict data>
  ' RETURNS
  '   Nothing
  ' NOTES
  '   1. Sets content-type header to 'application/json'
  '   2. Writes to response body
  """
  def reply(self, data={}):
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(response.reply(data, compiled=True))
  
  """
  ' PURPOSE
  '   Throws the error response corresponding with the given
  '   error code using the requests module.
  ' PARAMETERS
  '   <int code>
  ' RETURNS
  '   Nothing
  ' NOTES
  '   1. Sets content-type header to 'application/json'
  '   2. Writes to response body
  """
  def throw(self, code):
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(response.throw(code, compiled=True))
  
  """
  ' PURPOSE
  '   Given a post request, load the request body as a JSON.
  '   Then attempt to find a method field and then a corresponding
  '   API method. If found, execute and return the response.
  ' PARAMETERS
  '   None
  ' RETURNS
  '   Nothing
  ' NOTES
  '   1. Writes to the response body
  """
  def post(self):
    try:
      body = loads(self.request.body)
    except:
      """ JSON encoded improperly """
      self.throw('000')
      return
    
    method = body['__method__'] if '__method__' in body else None
    
    if method == None:
      """ Method not included """
      self.throw('001')
      return
    
    funct = locate(str(method))
    
    if funct == None:
      """ Method does not exist """
      self.throw('002')
      return
    
    """ Check that the method is a function """
    try:
      if not hasattr(funct, '__call__'):
        self.throw('003')
        return
    except:
      self.throw('003')
      return
    
    del body['__method__']
    self.reply(funct(**body))


"""
' PURPOSE
'   Given a method, locate the corresponding library function to execute.
'   For example, suppose a device sends the method 'device.register', this
'   function will return a function that will correctly register the device.
' PARAMETERS
'   <str method>
' RETURNS
'   <function Funct>
"""
def locate(method):
  funcs = {
    'device.register': device.register,
    'device.send': device.send
  }
  
  if not method in funcs:
    return None
  
  return funcs[method]


""" IMPLEMENTATION HOOK """
Hook = ('/device(?:/(?:.*))?', HookHandler)
