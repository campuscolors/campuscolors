(function(_app){
var configURI = (document.location.protocol == 'file:') ? _app.vars.testURL+'jsonapi/config.js' : _app.vars.baseURL+'jsonapi/config.js';

_app.u.loadScript(configURI,function(){
//in some cases, such as the zoovy UI, zglobals may not be defined. If that's the case, certain vars, such as jqurl, must be passed in via P in initialize:
//	_app.u.dump(" ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> zGlobals is an object");
	_app.vars.username = zGlobals.appSettings.username.toLowerCase(); //used w/ image URL's.
//need to make sure the secureURL ends in a / always. doesn't seem to always come in that way via zGlobals
	_app.vars.secureURL = zGlobals.appSettings.https_app_url;
	_app.vars.domain = zGlobals.appSettings.sdomain; //passed in ajax requests.
	_app.vars.jqurl = (document.location.protocol === 'file:') ? _app.vars.testURL+'jsonapi/' : '/jsonapi/';
	
	var startupRequires = ['quickstart','store_cc']
	
	if(_robots._robotGreeting){
		startupRequires.push('seo_robots');
		}
	else{
		_robots.hello = function(){
			_app.require('seo_robots', function(){
				//The init process of the ext should change the implementation of _robots.hello before it gets called here
				_robots.hello();
				});
			}
		}
	
	_app.require(startupRequires, function(){
		_app.ext.quickstart.callbacks.startMyProgram.onSuccess();
		
		$.extend(handlePogs.prototype,_app.ext.store_cc.variations);
		
		_app.ext.store_cc.u.runHeaderCarousel();
		//_app.ext.store_cc.u.swipeMobileNav($(".mobileSlideMenu"));
		_app.ext.store_cc.u.runFooterCarousel();
		
		//make sure minicart stays up to date. 
		//I know why you're doing this, but let's find a framework fix soon -mc
		_app.ext.store_cc.vars.mcSetInterval = setInterval(function(){
			_app.ext.quickstart.u.handleMinicartUpdate({'datapointer':'cartDetail|'+_app.model.fetchCartID()});
		},4000);
		
		if(_robots._robotGreeting){
			_app.ext.seo_robots.u.welcomeRobot(_robots._robotGreeting);
			}
		});
	}); //The config.js is dynamically generated.
	
_app.extend({
	"namespace" : "quickstart",
	"filename" : "app-quickstart.js"
	});

_app.couple('quickstart','addPageHandler',{
	"pageType" : "static",
	"require" : [],
	"handler" : function($container, infoObj){
		var deferred = $.Deferred();
		infoObj.defPipeline.addDeferred(deferred);
		if(infoObj.deferred){
			infoObj.defPipeline.addDeferred(infoObj.deferred);
			}
		//We use infoObj.require here because the router handlers may have put something in there.
		//By nature, the static page handler requires nothing, but the templates it renders may require all kinds of stuff
		infoObj.require = infoObj.require || [];
		_app.require(infoObj.require,function(){
			infoObj.verb = 'translate';
			infoObj.templateid = infoObj.templateID;
			var $page = new tlc().runTLC(infoObj);
			//$page.tlc(infoObj);
			$page.data('templateid',infoObj.templateid);
			$page.data('pageid',infoObj.id);
			$container.append($page);
			infoObj.state = 'complete';
			//this method is synchronous so no extra deferred required
			_app.renderFunctions.handleTemplateEvents($page,infoObj);
			deferred.resolve();
			});
		}
	});

_app.extend({
	"namespace" : "order_create",
	"filename" : "extensions/checkout/extension.js"
	});

_app.couple('quickstart','addPageHandler',{
	"pageType" : "checkout",
	"require" : ['order_create','cco', 'extensions/checkout/active.html'],
	"handler" : function($container, infoObj, require){
		var deferred = $.Deferred();
		infoObj.defPipeline.addDeferred(deferred);
		infoObj.templateID = 'checkoutTemplate';
		_app.require(require,function(){
			$container.attr('id', 'checkoutContainer');
			_app.ext.order_create.a.startCheckout($container,_app.model.fetchCartID());
			infoObj.state = 'complete'; //needed for handleTemplateEvents.
			_app.renderFunctions.handleTemplateEvents($container,infoObj);
			deferred.resolve();
			});
		}
	});
	
_app.extend({
	"namespace" : "cco",
	"filename" : "extensions/cart_checkout_order.js"
	});

_app.couple('quickstart','addPageHandler',{
	"pageType" : "cart",
	"require" : ['cco','order_create','templates.html'],
	"handler" : function($container, infoObj, require){
		infoObj.deferred = $.Deferred();
		infoObj.defPipeline.addDeferred(infoObj.deferred);
		infoObj.navcat = zGlobals.appSettings.rootcat;
		infoObj.cartid = _app.model.fetchCartID();
		infoObj.templateID = 'cartTemplate';
		infoObj.trigger = 'fetch';
		_app.require(require,function(){
			//var $cart = new tlc().getTemplateInstance('cartTemplate');
			//var $cart = $(_app.renderFunctions.createTemplateInstance('cartTemplate',infoObj));
			var $cart = _app.ext.cco.a.getCartAsJqObj(infoObj);
			$container.append($cart);
			
			$cart.on('complete',function(){
				$("[data-app-role='shipMethodsUL']",$(this)).find(":radio").each(function(){
					$(this).attr('data-app-change','quickstart|cartShipMethodSelect');
					});
				});

			$cart.trigger(infoObj.trigger,$.extend({'Q':'mutable'},infoObj));
				_app.model.dispatchThis('mutable');
			
			// _app.calls.cartDetail.init(_app.model.fetchCartID(),{
				// 'callback':'tlc',
				// 'onComplete' : function(){
					// infoObj.state = 'complete';
					// _app.renderFunctions.handleTemplateEvents($cart,$.extend(true,{},infoObj));
					// },
				// 'jqObj' : $cart,
				// 'verb' : 'translate'
				// },'mutable');
			// _app.model.dispatchThis('mutable');
			});
		}
	});
_app.u.bindTemplateEvent('cartTemplate','depart.destroy',function(event, $context, infoObj){
	var $page = $context.closest('[data-app-uri]');
	if($page){
		$page.empty().remove();
		}
	});

_app.extend({
	"namespace" : "store_routing",
	"filename" : "extensions/store_routing.js"
	});
	//formerly in startup callback of store_routing
_app.router.addAlias('product',		function(routeObj){_app.ext.quickstart.a.newShowContent(routeObj.value,	$.extend({'pageType':'product'}, routeObj.params));});
_app.router.appendHash({'type':'match','route':'/product/{{pid}}/{{name}}*','callback':'product'});
_app.router.appendHash({'type':'match','route':'/product/{{pid}}*','callback':'product'});


_app.router.addAlias('homepage',	function(routeObj){_app.ext.quickstart.a.newShowContent(routeObj.value,	$.extend({'pageType':'homepage'}, routeObj.params));});
_app.router.appendHash({'type':'exact','route':'/home','callback':'homepage'});
_app.router.appendHash({'type':'exact','route':'/home/','callback':'homepage'});
_app.router.appendHash({'type':'exact','route':'/','callback':'homepage'});

_app.router.addAlias('category',	function(routeObj){_app.ext.quickstart.a.newShowContent(routeObj.value,	$.extend({'pageType':'category'}, routeObj.params));});
_app.router.appendHash({'type':'match','route':'/category/{{navcat}}*','callback':'category'});

_app.router.addAlias('search',		function(routeObj){_app.ext.quickstart.a.newShowContent(routeObj.value,	$.extend({'pageType':'search'}, routeObj.params));});
_app.router.appendHash({'type':'match','route':'/search/tag/{{tag}}*','callback':'search'});
_app.router.appendHash({'type':'match','route':'/search/keywords/{{KEYWORDS}}*','callback':'search'});

_app.router.addAlias('checkout',	function(routeObj){_app.ext.quickstart.a.newShowContent(routeObj.value,	$.extend({'pageType':'checkout', 'requireSecure':true}, routeObj.params));});
_app.router.appendHash({'type':'exact','route':'/checkout','callback':'checkout'});
_app.router.appendHash({'type':'exact','route':'/checkout/','callback':'checkout'});

_app.router.addAlias('cart',	function(routeObj){_app.ext.quickstart.a.newShowContent(routeObj.value,	$.extend({'pageType':'cart'}, routeObj.params));});
_app.router.appendHash({'type':'exact','route':'/cart','callback':'cart'});
_app.router.appendHash({'type':'exact','route':'/cart/','callback':'cart'});

_app.router.appendHash({'type':'exact','route':'/404','callback':function(routeObj){
	$.extend(routeObj.params,{
		'pageType':'static',
		'templateID':'pageNotFoundTemplate',
		'require':'templates.html'
		});
	_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
	}});

_app.router.appendHash({'type':'exact','route':'/about_us/','callback':function(routeObj){
	$.extend(routeObj.params,{
		'pageType':'static',
		'templateID':'aboutUsTemplate',
		'require':['templates.html']
		});
	_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
	}});
_app.router.appendHash({'type':'exact','route':'/contact_us/','callback':function(routeObj){
	$.extend(routeObj.params,{
		'pageType':'static',
		'templateID':'contactUsTemplate',
		'require':['templates.html']
		});
	_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
	}});
_app.router.appendHash({'type':'exact','route':'/frequently_asked_questions/','callback':function(routeObj){
	$.extend(routeObj.params,{
		'pageType':'static',
		'templateID':'faqTemplate',
		'require':['templates.html']
		});
	dump(routeObj.params);
	routeObj.params.deferred = $.Deferred();
	_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
	}});
_app.u.bindTemplateEvent('faqTemplate','complete.faq',function(event, $context, infoObj){
	$context.off('complete.faq');
	dump('in faq complete event');
	_app.require(['store_crm','templates.html'],function(){
		_app.ext.store_crm.calls.appFAQsAll.init({'jqObj':$('.faqContent',$context),'deferred':infoObj.deferred,'callback':'showFAQTopics','extension':'store_crm','templateID':'faqTopicTemplate'});
		_app.model.dispatchThis();			
		});
	});
_app.router.appendHash({'type':'exact','route':'/payment_policy/','callback':function(routeObj){
	$.extend(routeObj.params,{
		'pageType':'static',
		'templateID':'paymentTemplate',
		'require':['templates.html']
		});
	_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
	}});
_app.router.appendHash({'type':'exact','route':'/privacy_policy/','callback':function(routeObj){
	$.extend(routeObj.params,{
		'pageType':'static',
		'templateID':'privacyTemplate',
		'require':['templates.html']
		});
	_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
	}});
_app.router.appendHash({'type':'exact','route':'/return_policy/','callback':function(routeObj){
	$.extend(routeObj.params,{
		'pageType':'static',
		'templateID':'returnTemplate',
		'require':['templates.html']
		});
	_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
	}});
_app.router.appendHash({'type':'exact','route':'/shipping_policy/','callback':function(routeObj){
	$.extend(routeObj.params,{
		'pageType':'static',
		'templateID':'shippingTemplate',
		'require':['templates.html']
		});
	_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
	}});
_app.router.appendHash({'type':'exact','route':'/store_locations/','callback':function(routeObj){
	$.extend(routeObj.params,{
		'pageType':'static',
		'templateID':'locationTemplate',
		'require':['templates.html']
		});
	_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
	}});
	
_app.u.bindTemplateEvent('myAccountTemplate','complete.customer',function(event, $context, infoObj){
	_app.ext.cco.calls.appCheckoutDestinations.init(_app.model.fetchCartID(),{},'mutable'); //needed for country list in address editor.
	_app.model.addDispatchToQ({"_cmd":"buyerAddressList","_tag":{'callback':'tlc','jqObj':$('.mainColumn',$context),'verb':'translate','datapointer':'buyerAddressList'}},'mutable');
	_app.model.dispatchThis();							
	});
_app.router.appendHash({'type':'exact','route':'/change_password/','callback':function(routeObj){
	$.extend(routeObj.params,{
		'pageType':'static',
		'login' : true,
		'templateID':'changePasswordTemplate',
		'require':['templates.html']
		});
	_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
	}});
_app.router.appendHash({'type':'exact','route':'/my_order_history/','callback':function(routeObj){
	$.extend(routeObj.params,{
		'pageType':'static',
		'login' : true,
		'templateID':'orderHistoryTemplate',
		'require':['templates.html']
		});
	_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
	}});
_app.u.bindTemplateEvent('changePasswordTemplate','complete.customer',function(event, $context, infoObj){
	_app.model.addDispatchToQ({"_cmd":"buyerPurchaseHistory","_tag":{
		"datapointer":"buyerPurchaseHistory",
		"callback":"tlc",
		"verb" : "translate",
		"jqObj" : $("[data-app-role='orderList']",$context).empty()
		}},"mutable");
	_app.model.dispatchThis();							
	});
_app.router.appendHash({'type':'exact','route':'/my_wishlist/','callback':function(routeObj){
	$.extend(routeObj.params,{
		'pageType':'static',
		'login' : true,
		'templateID':'customerListsTemplate',
		'require':['templates.html']
		});
	_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
	}});
_app.u.bindTemplateEvent('customerListsTemplate','complete.customer',function(event, $context, infoObj){
	_app.model.addDispatchToQ({"_cmd":"buyerProductLists","_tag":{"datapointer":"buyerProductLists",'verb':'translate','jqObj': $('.mainColumn',$context),'callback':'tlc',onComplete : function(rd){
//data formatting on lists is unlike any other format for product, so a special handler is used.				
		function populateBuyerProdlist(listID,$context)	{
			//add the product list ul here because tlc statement has list ID for bind.
			$("[data-buyerlistid='"+listID+"']",$context).append("<ul data-tlc=\"bind $var '.@"+listID+"'; store_prodlist#productlist  --hideSummary='1' --withReviews='1' --withVariations='1' --withInventory='1' --templateid='productListTemplateBuyerList'  --legacy;\" class='listStyleNone fluidList clearfix noPadOrMargin productList'></ul>");
			_app.model.addDispatchToQ({"_cmd":"buyerProductListDetail","listid":listID,"_tag" : {'datapointer':'buyerProductListDetail|'+listID,"listid":listID,'callback':'buyerListAsProdlist','extension':'quickstart', "require":"store_prodlist",'jqObj':$("[data-buyerlistid='"+listID+"'] ul",$context)}},'mutable');
			}
		
		var data = _app.data[rd.datapointer]['@lists']; //shortcut
		var L = data.length;
		var numRequests = 0;
		for(var i = 0; i < L; i += 1)	{
			populateBuyerProdlist(data[i].id,rd.jqObj)
			}
		_app.model.dispatchThis('mutable');
		//no sense putting 1 list into an accordion.
		if(L > 1)	{
			$('.applyAccordion',rd.jqObj).accordion({heightStyle: "content"});
			}
		}}},"mutable");
	_app.model.dispatchThis();							
	});

function loadPage(id, successCallback, failCallback){
	var pageObj = _app.ext.store_filter.vars.filterPageLoadQueue[id];
	if(pageObj){
		$.getJSON(pageObj.jsonPath+"?_v="+(new Date()).getTime(), function(json){
			_app.ext.store_filter.filterData[pageObj.id] = json;
			if(typeof successCallback == 'function'){
				successCallback();
				}
			})
			.fail(function(){
				dump("FILTER DATA FOR PAGE: "+pageObj.id+" UNAVAILABLE AT PATH: "+pageObj.jsonPath);
				if(typeof failCallback == 'function'){
					failCallback();
					}
				});
		}
	else {
		if(typeof failCallback == 'function'){
			failCallback();
			}
		}
	};

function showPage(routeObj,parentID){
//					dump('START showPage'); dump(routeObj);
	routeObj.params.templateid = routeObj.params.templateID || "filteredSearchTemplate";
//					dump(parentID);
	routeObj.params.dataset = $.extend(true, {}, $.grep(_app.ext.store_filter.filterData[parentID].pages,function(e,i){
		return e.id == routeObj.params.id;
	})[0]);
//					dump('routeObj.params.dataset');  dump(routeObj.params.dataset.optionList);
	
	var optStrs = routeObj.params.dataset.optionList;
	routeObj.params.dataset.options = routeObj.params.dataset.options || {};
	for(var i in optStrs){
//						dump('optStrs[i]'); dump(optStrs[i]);
		var o = optStrs[i];
		if(_app.ext.store_filter.vars.elasticFields[o]){
			routeObj.params.dataset.options[o] = $.extend(true, {}, _app.ext.store_filter.vars.elasticFields[o]);
			if(routeObj.hashParams[o]){
				var values = routeObj.hashParams[o].split('|');
				for(var i in routeObj.params.dataset.options[o].options){
					var option = routeObj.params.dataset.options[o].options[i];
					if($.inArray(option.v, values) >= 0){
						option.checked = "checked";
						}
					}
				}
			}
		else {
			dump("Unrecognized option "+o+" on filter page "+routeObj.params.id);
			}
		}
	routeObj.params.dataset.breadcrumb = [parentID,routeObj.params.id]	
	routeObj.params.loadFullList = _app.ext.seo_robots.u.isRobotPresent();
	routeObj.params.pageType = 'static'
	// showContent('static',routeObj.params);
	_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
	}


function showSubPage(routeObj,parentID){
//					dump('START showSubPage'); dump(routeObj);
	routeObj.params.templateid = routeObj.params.templateID || "filteredSearchTemplate";
//					dump(parentID); dump(_app.ext.store_filter.filterData);
	var filterData = _app.ext.store_filter.filterData[parentID]; //gets the top level data
//					dump('filtterData after gets top level data'); dump(filterData); dump(routeObj.params.id);
	filterData = $.grep(filterData.pages,function(e,i){
		return e.id == routeObj.params.id+"/";	//gets mid level data
	})[0];

//					dump(filterData);
	filterData = $.grep(filterData.pages,function(e,i){
		return e.id == routeObj.params.end+"/";	//gets the lowest level data
	})[0];
	routeObj.params.dataset = $.extend(true, {}, filterData);	//deep copy to avoid pass by reference bugs
	
	var optStrs = routeObj.params.dataset.optionList;
	routeObj.params.dataset.options = routeObj.params.dataset.options || {};
	for(var i in optStrs){
//						dump('optStrs[i]'); dump(optStrs[i]);
		var o = optStrs[i];
		if(_app.ext.store_filter.vars.elasticFields[o]){
			routeObj.params.dataset.options[o] = $.extend(true, {}, _app.ext.store_filter.vars.elasticFields[o]);
			if(routeObj.hashParams[o]){
				var values = routeObj.hashParams[o].split('|');
				for(var i in routeObj.params.dataset.options[o].options){
					var option = routeObj.params.dataset.options[o].options[i];
					if($.inArray(option.v, values) >= 0){
						option.checked = "checked";
						}
					}
				}
			}
		else {
			dump("Unrecognized option "+o+" on filter page "+routeObj.params.id);
			}
		}
	routeObj.params.loadFullList = _app.ext.seo_robots.u.isRobotPresent();
	routeObj.params.dataset.breadcrumb = [parentID,routeObj.params.id,routeObj.params.end]
	routeObj.params.id = routeObj.params.id + "-" + routeObj.params.end;
	routeObj.params.pageType = 'static';
	// showContent('static',routeObj.params);
	_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
	}

_app.router.addAlias('subcat', function(routeObj) {
	_app.require(['store_cc','store_filter','store_search','store_routing','prodlist_infinite','store_prodlist', 'templates.html'], function(){
		var a = routeObj.pagefilter;
		var b = routeObj.params.id+'/';
		$.getJSON("filters/apparel/"+a+".json?_v="+(new Date()).getTime(), function(json){
			var dataset = $.extend(true, {}, $.grep(json.pages,function(e,i){
				return e.id == b;
			})[0]);
			dataset.breadcrumb = [routeObj.pagefilter,routeObj.params.id]
			// showContent('static',{'templateid':'splashPageTemplate','id':routeObj.params.id,'dataset':dataset});
			_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
		})
		.fail(function() {
			dump('FILTER DATA FOR ' + a + 'COULD NOT BE LOADED.');
			_app.router.handleURIChange('/404');
		});
	});
});	

_app.router.addAlias('filter', function(routeObj){
	_app.require(['store_cc','store_filter','store_search','store_routing','prodlist_infinite','store_prodlist', 'templates.html'], function(){
//		dump('filter alias routeObj: '); dump(routeObj);
		//decides if filter JSON is in local var or if it needs to be retrieved
		var filterpage = routeObj.pagefilter;
			if(_app.ext.store_filter.filterData[filterpage]){
//			dump('RUNNING showPage');
			showPage(routeObj,filterpage);
		}
		else {
			dump('RUNNING filter loadPage');
			loadPage(
				filterpage, 
				function(){showPage(routeObj,filterpage);}, 
				function(){_app.router.handleURIChange('/404');}
			);
		}
	});
});

_app.router.addAlias('subfilter', function(routeObj){
	_app.require(['store_cc','store_filter','store_search','store_routing','prodlist_infinite','store_prodlist', 'templates.html'], function(){
		//decides if filter JSON is in local var or if it needs to be retrieved
		var filterpage = routeObj.pagefilter;
		if(_app.ext.store_filter.filterData[filterpage]){
	//							dump('RUNNING showPage');
			showSubPage(routeObj,filterpage);
		}
		else {
								dump('RUNNING subfilter loadPage');
			loadPage(
				filterpage, 
				function(){showSubPage(routeObj,filterpage);}, 
				function(){_app.router.handleURIChange('/404');}
			);
		}
	});
});

//sends passed object of attribs as a showContent search
_app.router.addAlias('promo', function(routeObj){
	_app.require(['store_cc','store_filter','store_search','store_routing','prodlist_infinite','store_prodlist', 'templates.html'], function(){
		var path = routeObj.params.PATH;
//		dump('promo Alias'); dump(path);
		$.getJSON("filters/search/"+path+".json?_v="+(new Date()).getTime(), function(json){
			dump('content shown from json');
//			dump('THE SEARCH JSON IS...'); dump(routeObj.params);
			routeObj.params.elasticsearch = json;
			showContent('search',	routeObj.params);
		})
		.fail(function() {
			dump('FILTER DATA FOR ' + path + 'COULD NOT BE LOADED.');
			_app.router.handleURIChange('/404');
		}); 
	});
});

_app.router.addAlias('root', function(routeObj){
	_app.require(['store_cc','store_filter','store_search','store_routing','prodlist_infinite','store_prodlist', 'templates.html'], function(){
		var route = routeObj.route;
		var route = route.split('/')[0];

		if(_app.ext.store_cc.vars[route]) {
			dump('IT WAS ALREADY THERE...');
			var filterData = $.extend(true, {}, _app.ext.store_cc.vars[route]);
			$.extend(true, routeObj.params, {'templateid':routeObj.templateid,'id':json.id,'dataset':filterData});
			_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
		}
		else {
			$.getJSON("filters/apparel/"+route+".json?_v="+(new Date()).getTime(), function(json){
				json.breadcrumb = [json.id];
				_app.ext.store_cc.vars[route] = json;
				//Deep copy into the routeObj.params, and that becomes our new "infoObj"
				//Need to pass through routeObj.params at this moment, as it is expected to become infoObj
				//This may change later.
				$.extend(true, routeObj.params, {'pageType':'static','templateid':routeObj.templateid,'id':json.id,'dataset':json});
				_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params);
			})
			.fail(function() {
				dump('FILTER DATA FOR ' + route + 'COULD NOT BE LOADED.');
			});
		}
	});
});

function createFilterPages(root, filter, subfilter){
	_app.router.appendHash({'type':'exact','route':'/'+root+'/','templateid':'splashPageTemplate','callback':'root'});
	if(filter){
		_app.router.appendHash({'type':'match','route':'/'+root+'/{{id}}/','pagefilter':root,'callback':'filter'});
		}
	if(subfilter){
		_app.router.appendHash({'type':'match','route':'/'+root+'/{{id}}/{{end}}/','pagefilter':root,'callback':'subfilter'});
		}
	_app.couple('store_filter','pushFilterPage',{id:root,jsonPath:"filters/apparel/"+root+".json"});
	}

createFilterPages('ncaa-apparel-merchandise', true);
createFilterPages('nfl-apparel-merchandise', true);
createFilterPages('nba-apparel-merchandise', true);
createFilterPages('ncaa-team-apparel-merchandise', true, true);
				//DO THIS FOR ALL THOSE BELOW:	
					
					_app.router.appendHash({'type':'exact','route':'/mlb-apparel-merchandise/','templateid':'splashPageTemplate','callback':'root'});
					_app.router.appendHash({'type':'match','route':'/mlb-apparel-merchandise/{{id}}/','pagefilter':'mlb-apparel-merchandise','callback':'filter'});
					_app.couple('store_filter','pushFilterPage',{id:"mlb-apparel-merchandise",jsonPath:"filters/apparel/.json"});
					
					
					_app.router.appendHash({'type':'exact','route':'/nhl-apparel-merchandise/','templateid':'splashPageTemplate','callback':'root'});
					_app.router.appendHash({'type':'match','route':'/nhl-apparel-merchandise/{{id}}/','pagefilter':'nhl-apparel-merchandise','callback':'filter'});
					_app.couple('store_filter','pushFilterPage',{id:"nhl-apparel-merchandise",jsonPath:"filters/apparel/.json"});
					
					_app.router.appendHash({'type':'exact','route':'/team-apparel-merchandise/','templateid':'splashPageTemplate','callback':'root'});
					
					_app.router.appendHash({'type':'match','route':'/team-apparel-merchandise/{{id}}*','pagefilter':'team-apparel-merchandise','callback':'filter'});
					_app.couple('store_filter','pushFilterPage',{id:"team-apparel-merchandise",jsonPath:"filters/apparel/.json"});
/* END CHECK FOR STILL VALID */
					
//TEAM BY LEAGUE APPENDS
/*ROOT*/		_app.router.appendHash({'type':'exact','route':'/ncaa-team-apparel-merchandise/','pagefilter':'ncaa-team-apparel-merchandise','templateid':'splashPageRootTemplate','callback':'root'});
/*SUB*/			_app.router.appendHash({'type':'match','route':'/ncaa-team-apparel-merchandise/{{id}}/','pagefilter':'ncaa-team-apparel-merchandise','callback':'subcat'});
			//		_app.couple('store_filter','pushFilterPage',{id:"ncaa-team-apparel-merchandise');
/*LEAF*/		_app.router.appendHash({'type':'match','route':'/ncaa-team-apparel-merchandise/{{id}}/{{end}}/','pagefilter':'ncaa-team-apparel-merchandise','callback':'subfilter'});
					_app.couple('store_filter','pushFilterPage',{id:"ncaa-team-apparel-merchandise",jsonPath:"filters/apparel/.json"});
					
/*ROOT*/		_app.router.appendHash({'type':'exact','route':'/nfl-team-apparel-merchandise/','pagefilter':'nfl-team-apparel-merchandise','templateid':'splashPageRootTemplate','callback':'root'});
/*SUB*/			_app.router.appendHash({'type':'match','route':'/nfl-team-apparel-merchandise/{{id}}/','pagefilter':'nfl-team-apparel-merchandise','callback':'subcat'});
			//		_app.couple('store_filter','pushFilterPage',{id:"nfl-team-apparel-merchandise');
/*LEAF*/		_app.router.appendHash({'type':'match','route':'/nfl-team-apparel-merchandise/{{id}}/{{end}}/','pagefilter':'nfl-team-apparel-merchandise','callback':'subfilter'});
					_app.couple('store_filter','pushFilterPage',{id:"nfl-team-apparel-merchandise",jsonPath:"filters/apparel/.json"});
					
/*ROOT*/		_app.router.appendHash({'type':'exact','route':'/nba-team-apparel-merchandise/','pagefilter':'nba-team-apparel-merchandise','templateid':'splashPageRootTemplate','callback':'root'});
/*SUB*/			_app.router.appendHash({'type':'match','route':'/nba-team-apparel-merchandise/{{id}}/','pagefilter':'nba-team-apparel-merchandise','callback':'subcat'});
			//		_app.couple('store_filter','pushFilterPage',{id:"nba-team-apparel-merchandise');
/*LEAF*/		_app.router.appendHash({'type':'match','route':'/nba-team-apparel-merchandise/{{id}}/{{end}}/','pagefilter':'nba-team-apparel-merchandise','callback':'subfilter'});
					_app.couple('store_filter','pushFilterPage',{id:"nba-team-apparel-merchandise",jsonPath:"filters/apparel/.json"});
					
/*ROOT*/		_app.router.appendHash({'type':'exact','route':'/mlb-team-apparel-merchandise/','pagefilter':'mlb-team-apparel-merchandise','templateid':'splashPageRootTemplate','callback':'root'});
/*SUB*/			_app.router.appendHash({'type':'match','route':'/mlb-team-apparel-merchandise/{{id}}/','pagefilter':'mlb-team-apparel-merchandise','callback':'subcat'});
			//		_app.couple('store_filter','pushFilterPage',{id:"mlb-team-apparel-merchandise');
/*LEAF*/		_app.router.appendHash({'type':'match','route':'/mlb-team-apparel-merchandise/{{id}}/{{end}}/','pagefilter':'mlb-team-apparel-merchandise','callback':'subfilter'});
					_app.couple('store_filter','pushFilterPage',{id:"mlb-team-apparel-merchandise",jsonPath:"filters/apparel/.json"});
					
/*ROOT*/		_app.router.appendHash({'type':'exact','route':'/nhl-team-apparel-merchandise/','pagefilter':'nhl-team-apparel-merchandise','templateid':'splashPageRootTemplate','callback':'root'});
/*SUB*/			_app.router.appendHash({'type':'match','route':'/nhl-team-apparel-merchandise/{{id}}/','pagefilter':'nhl-team-apparel-merchandise','callback':'subcat'});
			//		_app.couple('store_filter','pushFilterPage',{id:"nhl-team-apparel-merchandise');
/*LEAF*/		_app.router.appendHash({'type':'match','route':'/nhl-team-apparel-merchandise/{{id}}/{{end}}/','pagefilter':'nhl-team-apparel-merchandise','callback':'subfilter'});
					_app.couple('store_filter','pushFilterPage',{id:"nhl-team-apparel-merchandise",jsonPath:"filters/apparel/.json"});
					
/*ROOT*/		_app.router.appendHash({'type':'exact','route':'/soccer-team-apparel-merchandise/','pagefilter':'soccer-team-apparel-merchandise','templateid':'splashPageRootTemplate','callback':'root'});
/*SUB*/			_app.router.appendHash({'type':'match','route':'/soccer-team-apparel-merchandise/{{id}}/','pagefilter':'soccer-team-apparel-merchandise','callback':'subcat'});
			//		_app.couple('store_filter','pushFilterPage',{id:"soccer-team-apparel-merchandise');
/*LEAF*/		_app.router.appendHash({'type':'match','route':'/soccer-team-apparel-merchandise/{{id}}/{{end}}/','pagefilter':'soccer-team-apparel-merchandise','callback':'subfilter'});
					_app.couple('store_filter','pushFilterPage',{id:"soccer-team-apparel-merchandise",jsonPath:"filters/apparel/.json"});
//END TEAM BY LEAGUE APPENDS	

//LEAGUE APPENDS
/*ROOT*/		_app.router.appendHash({'type':'exact','route':'/league-apparel-merchandise/','pagefilter':'league-apparel-merchandise','templateid':'splashPageRootTemplate','callback':'root'});
/*SUB*/			_app.router.appendHash({'type':'match','route':'/league-apparel-merchandise/{{id}}/','pagefilter':'league-apparel-merchandise','callback':'subcat'});
			//		_app.couple('store_filter','pushFilterPage',{id:"soccer-team-apparel-merchandise');
/*LEAF*/		_app.router.appendHash({'type':'match','route':'/league-apparel-merchandise/{{id}}/{{end}}/','pagefilter':'league-apparel-merchandise','callback':'subfilter'});
					_app.couple('store_filter','pushFilterPage',{id:"league-apparel-merchandise",jsonPath:"filters/apparel/.json"});
					

//BRANDS APPENDS					
					_app.router.appendHash({'type':'exact','route':'/brands-apparel-merchandise/','templateid':'splashPageTemplate','callback':'root'});
					_app.router.appendHash({'type':'match','route':'/brands-apparel-merchandise/{{id}}/','pagefilter':'brands-apparel-merchandise','callback':'filter'});
					_app.couple('store_filter','pushFilterPage',{id:"brands-apparel-merchandise",jsonPath:"filters/apparel/.json"});

//TYPE/GENDER APPENDS
					_app.router.appendHash({'type':'exact','route':'/apparel-merchandise/','templateid':'splashPageTemplate','callback':'root'});
					_app.router.appendHash({'type':'match','route':'/apparel-merchandise/{{id}}/','pagefilter':'apparel-merchandise','callback':'filter'});
					_app.couple('store_filter','pushFilterPage',{id:"apparel-merchandise",jsonPath:"filters/apparel/.json"});
					
//CLEARANCE APPENDS					
					_app.router.appendHash({'type':'exact','route':'/sale-apparel-merchandise/','templateid':'splashPageTemplate','callback':'root'});
					_app.router.appendHash({'type':'match','route':'/sale-apparel-merchandise/{{id}}/','pagefilter':'sale-apparel-merchandise','callback':'filter'});
					_app.couple('store_filter','pushFilterPage',{id:"sale-apparel-merchandise",jsonPath:"filters/apparel/.json"});

//SEARCH APPENDS
					_app.router.appendHash({'type':'match','route':'/search/promo/{{PATH}}*','callback':'promo'});					
					

					
					_app.router.appendHash({'type':'exact','route':'/adidas-gear/','templateid':'splashPageTemplate','callback':'root'});
					_app.router.appendHash({'type':'match','route':'/adidas-gear/{{id}}/','pagefilter':'adidas-gear','callback':'filter'});
					_app.couple('store_filter','pushFilterPage',{id:"adidas-gear",jsonPath:"filters/apparel/.json"});
					
					_app.router.appendHash({'type':'exact','route':'/apparel/','templateid':'splashPageTemplate','callback':'root'});
					_app.router.appendHash({'type':'match','route':'/apparel/{{id}}/','pagefilter':'apparel','callback':'filter'});
					_app.couple('store_filter','pushFilterPage',{id:"apparel",jsonPath:"filters/apparel/.json"});
					
					_app.router.appendHash({'type':'exact','route':'/mens-apparel-merchandise/','templateid':'splashPageTemplate','callback':'root'});
					_app.router.appendHash({'type':'match','route':'/mens-apparel-merchandise/{{id}}/','pagefilter':'mens-apparel-merchandise','callback':'filter'});
					_app.couple('store_filter','pushFilterPage',{id:"mens-apparel-merchandise",jsonPath:"filters/apparel/.json"});
					
					_app.router.appendHash({'type':'exact','route':'/womens-apparel-merchandise/','templateid':'splashPageTemplate','callback':'root'});
					_app.router.appendHash({'type':'match','route':'/womens-apparel-merchandise/{{id}}/','pagefilter':'womens-apparel-merchandise','callback':'filter'});
					_app.couple('store_filter','pushFilterPage',{id:"womens-apparel-merchandise",jsonPath:"filters/apparel/.json"});
					
					_app.router.appendHash({'type':'exact','route':'/kids-apparel-merchandise/','templateid':'splashPageTemplate','callback':'root'});
					_app.router.appendHash({'type':'match','route':'/kids-apparel-merchandise/{{id}}/','pagefilter':'kids-apparel-merchandise','callback':'filter'});
					_app.couple('store_filter','pushFilterPage',{id:"kids-apparel-merchandise",jsonPath:"filters/apparel/.json"});	
					_app.couple('store_filter','pushFilterPage',{id:"",jsonPath:"filters/apparel/.json"});
_app.router.appendHash({'type':'match','route':'/filter/{{id}}*','callback':function(routeObj){
	_app.require(['store_swc','seo_robots', 'store_search','store_routing','prodlist_infinite','store_prodlist', 'templates.html'], function(){
		if(_app.ext.store_swc.filterData[routeObj.params.id]){
			function showFilterPage(){
				if(_app.ext.store_swc.vars.elasticFieldsLoaded){
					routeObj.params.templateID = "filteredSearchTemplate";
					routeObj.params.dataset = $.extend(true, {}, _app.ext.store_swc.filterData[routeObj.params.id]);
					if(routeObj.params.dataset.onEnter){
						routeObj.params.dataset.onEnter();
						}
					var optStrs = routeObj.params.dataset.optionList;
					routeObj.params.dataset.options = routeObj.params.dataset.options || {};
					for(var i in optStrs){
						var o = optStrs[i];
						if(_app.ext.store_swc.vars.elasticFields[o]){
							routeObj.params.dataset.options[o] = $.extend(true, {}, _app.ext.store_swc.vars.elasticFields[o]);
							if(routeObj.searchParams && routeObj.searchParams[o]){
								var values = routeObj.searchParams[o].split('|');
								for(var i in routeObj.params.dataset.options[o].options){
									var option = routeObj.params.dataset.options[o].options[i];
									if($.inArray(option.v, values) >= 0){
										option.checked = "checked";
										}
									}
								}
							}
						else {
							dump("Unrecognized option "+o+" on filter page "+routeObj.params.id);
							}
						}
					if(routeObj.searchParams && routeObj.searchParams.sport && routeObj.searchParams.team){
						_app.ext.store_swc.u.setUserTeam({sport:routeObj.searchParams.sport,team:routeObj.searchParams.team}, true);
						}
					routeObj.params.dataset.userTeam = _app.ext.store_swc.vars.userTeam;
					
					if(routeObj.params.dataset.titleBuilder){
						routeObj.params.dataset.seo_title = routeObj.params.dataset.titleBuilder(routeObj.params.dataset.userTeam.p);
						}
						
					if(routeObj.params.dataset.descriptionBuilder){
						routeObj.params.dataset.seo_description = routeObj.params.dataset.descriptionBuilder(routeObj.params.dataset.userTeam.p);
						}
					
					if(routeObj.params.dataset.metaDescriptionBuilder){
						routeObj.params.dataset.meta_description = routeObj.params.dataset.metaDescriptionBuilder(routeObj.params.dataset.userTeam.p);
						}
					routeObj.params.deferred = $.Deferred();
					// routeObj.params.loadFullList = _app.ext.seo_robots.u.isRobotPresent();
					routeObj.params.pageType = 'static';
					_app.ext.quickstart.a.newShowContent(routeObj.value,routeObj.params)
					}
				else{
					setTimeout(showFilterPage, 100);
					}
				}
			showFilterPage();
			}
		else {
			_app.ext.quickstart.a.newShowContent('404');
			}
		});
	}});
	
_app.u.bindTemplateEvent('filteredSearchTemplate', 'complete.filter',function(event, $context, infoObj){
	if(infoObj.deferred){
		$('form.filterList',$context).data('deferred', infoObj.deferred);
		}
	if(!$context.attr('data-filter-rendered')){
		var $form = $('form.filterList', $context);
		function submitForm(){
			if($form.attr('data-filter-base')){
				$form.trigger('submit');
				}
			else {
				// dump('gotta wait');
				setTimeout(submitForm,100);
				}
			}
		setTimeout(submitForm,0);
		}
	});

_app.u.bindTemplateEvent(function(){return true;}, 'complete.routing', function(event, $context, infoObj){
	if(infoObj){
		var canonical = "";
		
		var $routeEle = $('[data-canonical]',$context);
		if($routeEle.length){ canonical = $routeEle.attr('data-canonical'); }
		else{
			canonical = $context.closest('[data-app-uri]').attr('data-app-uri');
			}
		
		var $canonical = $('link[rel=canonical]')
		if(!$canonical.length){
			dump('NO CANONICAL IN THE DOCUMENT');
			$canonical = $('<link rel="canonical" href="" />');
			$('head').append($canonical);
			}
		$canonical.attr('href', canonical);
		}
	});
	
_app.extend({
	"namespace" : "store_tracking",
	"filename" : "extensions/store_tracking.js"
	});
_app.couple('order_create','addOrderCompleteHandler',{
	'handler':function(P){
		_app.require('store_tracking',function(){
			if(P && P.datapointer && _app.data[P.datapointer] && _app.data[P.datapointer].order){
				var order = _app.data[P.datapointer].order;
				var plugins = zGlobals.plugins;
				// note: order is an object that references the raw (public) cart
				// order.our.xxxx  order[@ITEMS], etc.
				// data will appear in google analytics immediately after adding it (there is no delay)
				ga('require', 'ecommerce');
				//analytics tracking
				var r = {
					'id' : order.our.orderid,
					'revenue' : order.sum.items_total,
					'shipping' : order.sum.shp_total,
					'tax' : order.sum.tax_total
					};
				// _app.u.dump(r);
				ga('ecommerce:addTransaction',r);

				for(var i in order['@ITEMS']){
					var item = order['@ITEMS'][i];
					// _app.u.dump(item);
					ga('ecommerce:addItem', {
						'id' : order.our.orderid,
						'name' : item.prod_name,
						'sku' : item.sku,
						'price' : item.base_price,
						'quantity' : item.qty,
						})
					};

				ga('ecommerce:send');
				_app.u.dump('FINISHED store_tracking.onSuccess (google analytics)');
				
				for(var i in plugins){
					if(_app.ext.store_tracking.trackers[i] && _app.ext.store_tracking.trackers[i].enable){
						_app.ext.store_tracking.trackers[i](order, plugins[i]);
						}
					}
				}
			});
		}
	});

//Generate meta information
_app.u.bindTemplateEvent(function(){return true;}, 'complete.metainformation',function(event, $context, infoObj){
	var defaultTitle = "Shop Campus Colors for thousands of NCAA, NFL, NBA, MLB, & NHL products, novelties and more! We offer gear from top brands such as Nike & Adidas. Ship Same-Day to All 50 States!";
	var titlePrefix = "";
	var titlePostfix = " | CampusColors.com";
	
	var baseTitle = $('[data-seo-title]', $context).attr('data-seo-title') || defaultTitle;
	var desc = $('[data-seo-desc]', $context).attr('data-seo-desc') || '';
	
	document.title = titlePrefix + baseTitle + titlePostfix;
	$('meta[name=description]').attr('content', desc);
	});
	
//Scroll restore
_app.u.bindTemplateEvent(function(){return true;}, 'complete.scrollrestore',function(event, $context, infoObj){
	var scroll = $context.data('scroll-restore');
	if(scroll){
		$('html, body').animate({scrollTop : scroll}, 300);
		}
	else if((infoObj.performJumpToTop === false) ? false : true) {
		$('html, body').animate({scrollTop : 0}, 300);
		}
	else {
		//do nothing
		}
	});
	
_app.u.bindTemplateEvent(function(){return true;}, 'depart.scrollrestore', function(event, $context, infoObj){
	var scroll = $('html').scrollTop()
	$context.data('scroll-restore',scroll);
	});

_app.extend({
	"namespace" : "store_cc",
	"filename" : "extensions/_store_cc.js"
	});
_app.extend({
	"namespace" : "store_filter",
	"filename" : "extensions/_store_filter.js"
	});
	
_app.u.bindTemplateEvent('homepageTemplate', 'complete.store_cc',function(event,$context,infoObj) {
	$(".mobileSlideMenu.standardNav").addClass("hideOnHome");
	_app.ext.store_cc.u.showHomepageBanners($context);
	_app.ext.store_cc.u.runHomeCarousel($context);
	});
_app.u.bindTemplateEvent('homepageTemplate', 'depart.store_cc',function(event,$context,infoObj) {
	$(".mobileSlideMenu.standardNav").removeClass("hideOnHome");
	});
	
_app.u.bindTemplateEvent('productTemplate', 'complete.invcheck',function(event, $context, infoObj){
	if(!$context.attr('data-invcheck')){
		$context.attr('data-invcheck','true');
		var data = _app.data['appProductGet|'+infoObj.pid];
		var variations = data['@variations'];
		if(variations.length == 1 /*&& variations[0].id.match(/A[BDEFGHM]/) */){
			var id = variations[0].id;
			$('select[name='+id+'] option', $context).each(function(){
				var sku = infoObj.pid+":"+id+""+$(this).attr("value");
				dump(sku);
				dump(data["@inventory"][sku]);
				if(data["@inventory"][sku] && data["@inventory"][sku].AVAILABLE <= 0){
					//$(this).attr("disabled","disabled");
					$(this).remove();
					}
				});
			}
		}
	});

_app.u.bindTemplateEvent('productTemplate', 'complete.store_cc', function(event, $context, infoObj){
	_app.ext.store_cc.u.showRecentlyViewedItems($context);
	_app.ext.store_cc.u.runPreviousCarousel($context);
	_app.ext.store_cc.u.showHideVariation($context,infoObj);
	});
_app.u.bindTemplateEvent('productTemplate', 'depart.store_cc', function(event, $context, infoObj){
	_app.ext.store_cc.u.addRecentlyViewedItems($context, infoObj.pid);
	});
	
					
_app.extend({
	"namespace" : "seo_robots",
	"filename" : "extensions/_robots.js"
	});
	
_app.extend({
	"namespace" : "store_prodlist",
	"filename" : "extensions/store_prodlist.js"
	});
	
_app.extend({
	"namespace" : "prodlist_infinite",
	"filename" : "extensions/prodlist_infinite.js"
	});
	
_app.extend({
	"namespace" : "store_navcats",
	"filename" : "extensions/store_navcats.js"
	});
	
_app.couple('quickstart','addPageHandler',{
	"pageType" : "homepage",
	"require" : ['store_navcats','templates.html','store_routing'],
	"handler" : function($container, infoObj, require){
		infoObj.deferred = $.Deferred();
		infoObj.defPipeline.addDeferred(infoObj.deferred);
		dump('homepage handler');
		infoObj.navcat = zGlobals.appSettings.rootcat;
		_app.require(require,function(){
			infoObj.templateID = 'homepageTemplate';
			_app.ext.store_navcats.u.showPage($container, infoObj);
			});
		}
	});
	
_app.couple('quickstart','addPageHandler',{
	"pageType" : "category",
	"require" : ['store_navcats','store_prodlist','prodlist_infinite','templates.html','store_routing'],
	"handler" : function($container, infoObj, require){
		infoObj.deferred = $.Deferred();
		infoObj.defPipeline.addDeferred(infoObj.deferred);
		if(infoObj.navcat.charAt(0) != '.'){
			infoObj.navcat = '.'+infoObj.navcat
			}
		if(_app.ext.quickstart.vars.session.recentCategories[0] != infoObj.navcat)	{
			_app.ext.quickstart.vars.session.recentCategories.unshift(infoObj.navcat);
			}
		_app.require(require,function(){
			if(infoObj.templateID){}
			//else if(infoObj.templateID = _app.ext.store_swc.u.fetchTemplateForPage(infoObj.navcat)){}
			else{infoObj.templateID = 'categoryTemplate';}
			if(infoObj.templateID = 'categoryTemplate'){
				infoObj.prodRenderedDeferred = $.Deferred();
				infoObj.defPipeline.addDeferred(infoObj.prodRenderedDeferred);
				}
			_app.ext.store_navcats.u.showPage($container, infoObj);
			});
						
		}
	});
	
_app.extend({
	"namespace" : "store_search",
	"filename" : "extensions/store_search.js"
	});
	
// _app.couple('store_search','addUniversalFilter',{
	// 'filter' : {"has_child":{"type":"sku","query":{"range":{"available":{"gte":1}}}}}
	// });
// _app.couple('store_search','addUniversalFilter',{
	// 'filter' : {"not":{"term":{"tags":"IS_DISCONTINUED"}}}
	// });
				
_app.couple('quickstart','addPageHandler',{
	"pageType" : "search",
	"require" : ['store_search','templates.html','store_routing'],
	"handler" : function($container, infoObj, require){
		infoObj.deferred = $.Deferred();
		infoObj.defPipeline.addDeferred(infoObj.deferred);
		_app.require(require,function(){
			_app.ext.store_search.u.showSearch($container, infoObj);
			});
						
		}
	});
	
_app.extend({
	"namespace" : "store_product",
	"filename" : "extensions/store_product.js"
	});


_app.couple('quickstart','addPageHandler',{
	"pageType" : "product",
	"require" : ['store_product','store_navcats', 'store_routing', 'store_search', 'templates.html', 'jerseypreview'],
	"handler" : function($container, infoObj, require){
		infoObj.deferred = $.Deferred();
		infoObj.defPipeline.addDeferred(infoObj.deferred);
		if($.inArray(infoObj.pid,_app.ext.quickstart.vars.session.recentlyViewedItems) < 0)	{
			_app.ext.quickstart.vars.session.recentlyViewedItems.unshift(infoObj.pid);
			}
		else	{
			_app.ext.quickstart.vars.session.recentlyViewedItems.splice(0, 0, _app.ext.quickstart.vars.session.recentlyViewedItems.splice($.inArray(infoObj.pid, _app.ext.quickstart.vars.session.recentlyViewedItems), 1)[0]);
			}
		//IMPORTANT: requiring every extension needed in order to render the page, including TLC formats in the template
		_app.require(require, function(){
			infoObj.templateID = 'productTemplate';
			_app.ext.store_product.u.showProd($container, infoObj);
			});
		}
	});
	
_app.extend({
	"namespace" : "store_crm",
	"filename" : "extensions/store_crm.js"
	});
	
// _app.extend({
	// "namespace" : "partner_addthis",
	// "filename" : "extensions/partner_addthis.js"
	// });
// _app.u.bindTemplateEvent('productTemplate', 'complete.test', function(event, $context, infoObj){
	// var $toolbox = $('.socialLinks', $context);
	// if($toolbox.hasClass('addThisRendered')){
		// //Already rendered, don't do it again.
		// }
	// else {
		// $toolbox.addClass('addThisRendered').append(
				// '<div class="addthis_toolbox addthis_default_style addthis_32x32_style">'
			// +		'<a class="addthis_button_preferred_1"></a>'
			// +		'<a class="addthis_button_preferred_2"></a>'
			// +		'<a class="addthis_button_preferred_3"></a>'
			// +		'<a class="addthis_button_preferred_4"></a>'
			// +		'<a class="addthis_button_preferred_5"></a>'
			// +		'<a class="addthis_button_preferred_6"></a>'
			// +		'<a class="addthis_button_preferred_7"></a>'
			// +		'<a class="addthis_button_preferred_8add"></a>'
			// +		'<a class="addthis_button_compact"></a>'
			// +	'</div>');
		
		// _app.ext.partner_addthis.u.toolbox($toolbox, infoObj);
		// }
	// });
	
_app.rq.push(['script',0,'lightbox/js/lightbox-2.6.min.js']);

_app.model.getGrammar("pegjs");


//Any code that needs to be executed after the app init has occured can go here.
//will pass in the page info object. (pageType, templateID, pid/navcat/show and more)
_app.u.appInitComplete = function()	{
//	_app.u.dump("Executing _appIsLoaded code...");
	
	_app.ext.order_create.checkoutCompletes.push(function(vars,$checkout){
		dump(" -> begin checkoutCOmpletes code: "); dump(vars);
		
		var cartContentsAsLinks = encodeURIComponent(_app.ext.cco.u.cartContentsAsLinks(_app.data[vars.datapointer].order));
	
		
//append this to 
		$("[data-app-role='thirdPartyContainer']",$checkout).append("<h2>What next?</h2><div class='ocm ocmFacebookComment pointer zlink marginBottom checkoutSprite  '></div><div class='ocm ocmTwitterComment pointer zlink marginBottom checkoutSprit ' ></div><div class='ocm ocmContinue pointer zlink marginBottom checkoutSprite'></div>");
		$('.ocmTwitterComment',$checkout).click(function(){
			window.open('http://twitter.com/home?status='+cartContentsAsLinks,'twitter');
			window[_app.vars.analyticsPointer]('send', 'event','Checkout','User Event','Tweeted about order');
			window[_app.vars.analyticsPointer]('send', 'event','Checkout','User Event','Tweeted about order');
			});
		//the fb code only works if an appID is set, so don't show banner if not present.				
		if(_app.u.thisNestedExists("zGlobals.thirdParty.facebook.appId") && typeof FB == 'object')	{
			$('.ocmFacebookComment',$checkout).click(function(){
				_app.ext.quickstart.thirdParty.fb.postToWall(cartContentsAsLinks);
				ga('send','event','Checkout','User Event','FB message about order');
				window[_app.vars.analyticsPointer]('send', 'event','Checkout','User Event','FB message about order');
				});
			}
		else	{$('.ocmFacebookComment').hide()}
		});
	
	//Cart Messaging Responses.
	_app.cmr.push(['chat.join',function(message){
		if(message.FROM == 'ADMIN')	{
			var $ui = _app.ext.quickstart.a.showBuyerCMUI();
			$("[data-app-role='messageInput']",$ui).show();
			$("[data-app-role='messageHistory']",$ui).append("<p class='chat_join'>"+message.FROM+" has joined the chat.<\/p>");
			$('.show4ActiveChat',$ui).show();
			$('.hide4ActiveChat',$ui).hide();
			}
		}]);

	_app.cmr.push(['goto',function(message,$context){
		var $history = $("[data-app-role='messageHistory']",$context);
		$P = $("<P>")
			.addClass('chat_post')
			.append("<span class='from'>"+message.FROM+"<\/span> has sent over a "+(message.vars.pageType || "")+" link for you within this store. <span class='lookLikeLink'>Click here<\/span> to view.")
			.on('click',function(){
				showContent(_app.ext.quickstart.u.whatAmIFor(message.vars),message.vars);
				});
		$history.append($P);
		$history.parent().scrollTop($history.height());
		}]);

	}





//this will trigger the content to load on app init. so if you push refresh, you don't get a blank page.
//it'll also handle the old 'meta' uri params.
//this will trigger the content to load on app init. so if you push refresh, you don't get a blank page.
//it'll also handle the old 'meta' uri params.
_app.router.appendInit({
	'type':'function',
	'route': function(v){
		return {'init':true} //returning anything but false triggers a match.
		},
	'callback':function(f,g){
		dump(" -> triggered callback for appendInit");
		g = g || {};
		var $existingPage = $('#mainContentArea [data-app-uri]');
		console.log($existingPage.length);
		if($existingPage.length /*&& $existingPage.attr('data-app-uri') == document.location.pathname*/){
			//We are a transplanted document, let's load accordingly.
			//re-attach template handlers
			var $renderedTemplate = $('[data-templateid]', $existingPage);
			var templateid = $renderedTemplate.attr('data-templateid');
			for(var i in _app.templateEvents){
				var event = _app.templateEvents[i];
				if(event.filterFunc(templateid)){
					dump("Attaching event");
					dump(event);
					$renderedTemplate.on(event.event, event.handler);
					}
				}
			//handleURIChange here will not change the page, but it will execute appropriate events
			_app.router.handleURIString($existingPage.attr('data-app-uri'), true, {"retrigger" : true});
			}
		else if (document.location.hash.indexOf("#!") == 0){
			var pathStr = document.location.hash.substr(2);
			var search = false;
			if(pathStr.indexOf('?') >= 0){
				var arr = pathStr.split('?');
				pathStr = arr[0];
				search = arr[1];
				}
			_app.router.handleURIChange("/"+pathStr, search, false, true);
			}
		else if(document.location.protocol == "file:"){
			_app.router.handleURIChange("/", document.location.search, document.location.hash, true);
			}
		else if (g.uriParams.marketplace){
			showContent("product",{"pid":g.uriParams.product});
			window[_app.vars.analyticsPointer]('send','event','Arrival','Syndication','product '+g.uriParams.product);
			}
		else if(document.location.pathname)	{	
			_app.u.dump('triggering handleHash');
			_app.router.handleURIChange(document.location.pathname, document.location.search, document.location.hash, true);
			}
		else	{
			_app.router.handleURIChange("/", document.location.search, document.location.hash, true);
			_app.u.throwMessage(_app.u.successMsgObject("We're sorry, the page you requested could not be found!"));
			window[_app.vars.analyticsPointer]('send', 'event','init','404 event',document.location.href);
			}
		if(g.uriParams && g.uriParams.meta)	{
			_app.require('cco', function(){
				_app.ext.cco.calls.cartSet.init({'want/refer':g.uriParams.meta,'cartID':_app.model.fetchCartID()},{},'passive');
				});
			}
		if(g.uriParams && g.uriParams.meta_src)	{
			_app.require('cco',function(){
				_app.ext.cco.calls.cartSet.init({'want/refer_src':g.uriParams.meta_src,'cartID':_app.model.fetchCartID()},{},'passive');
				});
			}
		}
	});




})(myApp);