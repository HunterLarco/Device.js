/*
 * PURPOSE
 *    Wraps the Post.js class with the ability to understand the server's
 *    protocol. Explained in the function 'APIPost'.
*/
(function(){
  
  
  /*
   * PURPOSE
   *    Given a completed request, onresponse event, and onerror event,
   *    route the request to either the onresponse event or onerror
   *    based on the 'stat' field of the response JSON body.
   * PARAMETERS
   *    <XMLHttpRequest request>
   *    optional <function onresponse(obj)>
   *    optional <function onerror(obj{stat, code, message})>
   * RETURNS
   *    Nothing
  */
  function RouteResponse(request, onresponse, onerror){
    var event = JSON.parse(request.response);
    
    if(event.stat != 'ok') if(typeof onerror == 'function'){onerror(event);}
    else if(typeof onresponse == 'function'){onresponse(event.data);}
  }
  
  /*
   * PURPOSE
   *    Handles internal errors. If a request fails due to
   *    a client-side error or wifi problem this event will fire
   *    sending the error code (-1)
   * PARAMETERS
   *    None
   * RETURNS
   *    Nothing
  */
  function HandlerError(request, onerror){
    if(typeof onerror == 'function') onerror({
      'stat': 'fail',
      'code': '-1',
      'message': 'Unknown Internal Error'
    });
  }
  
  /*
   * PURPOSE
   *    Given a url, data, onresponse event, and onerror event,
   *    send a post request to the given url containing the given data
   *    encoded as a JSON on the request body. Based on the success of
   *    the request based on the server protocol (explained in notes)
   *    fire the onresponse or onerror event.
   * PARAMETERS
   *    <string url>
   *    <object data>
   *    optional <function onresponse(obj)>
   *    optional <function onerror(obj{stat, code, message})>
   * RETURNS
   *    Nothing
   * NOTES
   *    1. If the returned JSON failed the 'stat' field is 'fail',
   *       otherwise it is 'ok'.
  */
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