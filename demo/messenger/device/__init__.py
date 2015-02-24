import response
import device
import shortener
all = ['response', 'device', 'shortener']


import webapp2
from json import loads, dumps


# 000-003
class HookHandler(webapp2.RequestHandler):
  def reply(self, data=None):
    self.response.headers['Content-Type'] = 'application/json'
    data = {} if data == None else data
    self.response.out.write(response.reply(data, compiled=True))
  
  def throw(self, code):
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(response.throw(code, compiled=True))
  
  def post(self):
    try:
      body = loads(self.request.body)
    except:
      self.throw('000')
      return
    
    method = body['__method__'] if '__method__' in body else None
    
    if method == None:
      self.throw('001')
      return
    
    funct = locate(str(method))
    
    if funct == None:
      self.throw('002')
      return
    
    try:
      if not hasattr(funct, '__call__'):
        self.throw('003')
        return
    except:
      self.throw('003')
      return
    
    del body['__method__']
    self.reply(funct(**body))
    

def locate(loc, relative=True):
  loc = loc.strip('.')
  from importlib import import_module
  def recurse(method, offset):
    if offset == len(method): return None
    try:
      method_slice = method if offset == 0 else method[:-offset]
      trial_module = '.'.join(method_slice)
      if relative: trial_module = '.'+trial_module
      return import_module(trial_module, package=__name__)
    except:
      module = recurse(method, offset+1)
      part = method[-offset-1]
      if module == None: return None
      if not hasattr(module, part): return None
      return getattr(module, part)
  return recurse(loc.split('.'), 0)


Hook = ('/device(?:/(?:.*))?', HookHandler)