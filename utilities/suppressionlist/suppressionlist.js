var fs = require('fs');
var now = new Date();

var domain = "beta.campuscolors.com";
var out = '../../suppression.json';

var CommerceEngine = require('./commerce-engine.js');
var ce = new CommerceEngine(domain, {'pipelineSize':2});

var suppress = [];

var datafiles = [
	"../../filters/apparel/apparel-merchandise.json",
	"../../filters/apparel/brands-apparel-merchandise.json",
	"../../filters/apparel/league-apparel-merchandise.json",
	"../../filters/apparel/mlb-team-apparel-merchandise.json",
	"../../filters/apparel/nba-team-apparel-merchandise.json",
	"../../filters/apparel/ncaa-team-apparel-merchandise.json",
	"../../filters/apparel/nfl-team-apparel-merchandise.json",
	"../../filters/apparel/nhl-team-apparel-merchandise.json",
	"../../filters/apparel/sale-apparel-merchandise.json",
	"../../filters/apparel/soccer-team-apparel-merchandise.json",
	"../../filters/apparel/team-apparel-merchandise.json"
	]

var count = 0;
function processPage(page){
	if(page.baseFilter){
		var call = {
			"type": "product",
			"mode": "elastic-search",
			"size": 1,
			"_cmd": "appPublicSearch"
			};
		call.filter = {
			"and" : [
				{"has_child":{"type":"sku","query":{"range":{"available":{"gte":1}}}}},
				{"not":{"term":{"tags":"IS_DISCONTINUED"}}}
				]
			}
		call.filter.and.push(page.baseFilter);
		ce.enqueue(call,function(response){
			// console.log(count++);
			if(!response._count || response._count < 1){
				console.log('Suppressing '+page.link);
				suppress.push(page.link);
				}
			else {
				// console.log('We had at least one response: '+response._count);
				}
			});
		}
	//recurse
	if(page.pages){
		for(var i in page.pages){
			processPage(page.pages[i]);
			}
		}
	}

for(var i in datafiles){
	var page = require(datafiles[i]);
	processPage(page);
}
ce.dispatch(function(data){
	console.log('finishing...');
	fs.writeFileSync(out, JSON.stringify(suppress));
	});