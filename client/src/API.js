(function(){
  
  function RouteResponse(request, onresponse, onerror){
    var event = JSON.parse(request.response);
    
    if(event.stat != 'ok') if(typeof onerror == 'function'){onerror(event);}
    else if(typeof onresponse == 'function'){onresponse(event.data);}
  }
  
  function HandlerError(request, onerror){
    if(typeof onerror == 'function') onerror({
      'stat': 'fail',
      'code': '-1',
      'message': 'Unknown Internal Error'
    });
  }
  
  function APIPost(url, data, onresponse, onerror){
    Post(
      url,
      data,
      function(event){RouteResponse(event, onresponse, onerror)},
      function(event){HandlerError(event, onerror)}
    );
  }
  
  window.API = {
    post: APIPost
  };
  
})();