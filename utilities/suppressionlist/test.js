var domain = "beta.campuscolors.com";

var CommerceEngine = require('./commerce-engine.js');
var ce = new CommerceEngine(domain, {'pipelineSize':2});

ce.enqueue({
		"type": "sku",
		"mode": "elastic-search",
		"size": 50,
		"_cmd": "appPublicSearch",
		"query" : {"regexp":{"sku":".+(:SZMD).*"}}
		}, 
	function(data){
		console.dir(data);
		});

ce.dispatch();