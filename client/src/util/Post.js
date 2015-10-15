/*
 * PURPOSE
 *    Provides an easy way to send post requests to a server.
 *    See window.Post for documentation of usage. (below)
*/
(function(){
	
  /*
   * PURPOSE
   *    Given a url and data send a post request with the given
   *    data to the given url.
   * PARAMETERS
   *    <string url>
   *    <object data>
   *    optional <function onresponse(XMLHttpRequest)>
   *    optional <function onerror(XMLHttpRequest)>
   * RETURNS
   *    Nothing
   * NOTES
   *    1. Sends posts with the content-type 'application/x-www-form-urlencoded'
  */
  window.Post = function Post(url, data, onresponse, onerror){
    if(typeof data != 'string') data = JSON.stringify(data);
		
    var request = CreateRequest();
		
    request.open('POST', url, true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		
    request.onreadystatechange = function OnStateChange(){
      if(request.readyState != 4) return;
      if(request.status != 200 && request.status != 304){
        if(typeof onerror == 'function') onerror(request);
        return;
      }
      if(typeof onresponse == 'function') onresponse(request);
    }

    request.send(data);
  }

  /* Different means of creating a XMLHttpRequest */
  var XMLHttpFactories = [
    function() {return new XMLHttpRequest()},
    function() {return new ActiveXObject("Msxml2.XMLHTTP")},
    function() {return new ActiveXObject("Msxml3.XMLHTTP")},
    function() {return new ActiveXObject("Microsoft.XMLHTTP")}
  ];

  /*
   * PURPOSE
   *    Creates a XMLHttpRequest using the 'XMLHttpFactories' variable.
   * PARAMETERS
   *    None
   * RETURNS
   *    <XMLHttpRequest request>
  */
  function CreateRequest() {
    var xmlhttp = false;
    for(var i=0;i<XMLHttpFactories.length;i++){
      try{ xmlhttp = XMLHttpFactories[i](); }
      catch(e){ continue; }
      break;
    }
    return xmlhttp;
  }
	
})();