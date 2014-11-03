var _ = require('underscore');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

function commerceEngine(domain, options){
	options = options || {};
	this._domain = domain;
	this._apiurl = "http://"+domain+"/jsonapi/";
	this._clientid = options.clientid || "zmvc";
	this._version = options.version || 201410;
	this._session = new Date().getTime();
	this._uuid = 0;
	this._requestNumber = 0;
	this.pipelineSize = options.pipelineSize || 20;
	
	this.queue = [];
		
	}

commerceEngine.prototype._pipeline = function(){
	return {
		_clientid : this._clientid,
		_domain : this._domain,
		_version : this._version,
		_session :	this._session,
		_uuid : this._uuid++,
		_cmd : "pipeline",
		"@cmds" : []
		};
	}

commerceEngine.prototype.enqueue = function(request, callback){
	if(request){
		var id = new Date().getTime() + "" + this._requestNumber++;
		callback = callback || function(){};
		this.queue.push({
			id : id,
			request : request,
			callback : callback
			});
		return id;
		}
	else {
		return null;
		}
	}

commerceEngine.prototype.dispatch = function(finalCallback){
	finalCallback = finalCallback || function(){};
	//Empty the queue
	var q = this.queue.slice();
	this.queue = [];
	//build pipeline requests
	var currPipe = -1;
	var pipes = [];
	var pipeMap = [];
	for(var i in q){
		if(currPipe < 0 || pipes[currPipe]['@cmds'].length >= this.pipelineSize){
			currPipe++;
			pipes[currPipe] = this._pipeline();
			pipeMap[currPipe] = [];
			}
		var requestObj = q[i];
		pipes[currPipe]['@cmds'].push(requestObj.request);
		pipeMap[currPipe].push(requestObj);
		}
	//dispatch them
	var complete = new Array(pipes.length);
	for(var i in complete){
		complete[i] = false;
		}
	var finalData = {};
	
	var _self = this;
	for(var i in pipes){
		setTimeout((function(index){
			return function(){
				var request = new XMLHttpRequest();
				request.open('POST',_self._apiurl);
				request.setRequestHeader('Content-Type','application/json');
				request.onreadystatechange = function(){
					if(request.readyState == 4 && request.status == 200 && !complete[index]){
						var r = JSON.parse(request.responseText);
						for(var i in r['@rcmds']){
							var data = r['@rcmds'][i];
							var requestObj = pipeMap[index][i];
							finalData[requestObj.id] = data;
							requestObj.callback(data);
							}
						//check for final completion
						complete[index] = true;
						var done = true;
						for(var i = 0; i < complete.length; i++){
							if(!complete[i]){
								done = false;
								break;
								}
							}
						if(done){
							finalCallback(finalData);
							}
						}
					}
				request.send(JSON.stringify(pipes[index]));
				}
			})(i),i*20)
		}
	}

module.exports = commerceEngine;