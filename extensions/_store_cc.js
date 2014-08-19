/* **************************************************************

   Copyright 2013 Zoovy, Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

************************************************************** */



//    !!! ->   TODO: replace 'username' in the line below with the merchants username.     <- !!!

var store_cc = function(_app) {
	var theseTemplates = new Array('');
	var r = {
	
	
	vars : {
		"nhl" : {
			"id"	: "NHL-Apparel",
			"page-title" : "NHL Apparel at CampusColors.com",
			"page-description" : "Buy NHL, it is bloody good!",
			"pages" : [
				{
					"id" 			: "nhl-t-shirts",
					"link"			: "#!nhl-apparel/nhl-t-shirts", 
					"img" 			: "3_prongs_standard",
					"name"			: "NHL T-shirts",
					"baseFilter" 	: { "and" : [ {"term" : {"prod_is_general" : "nhl_clothing"}} , {"term" : {"apparel_type" : "t-shirts"}}]}
				},
				{
					"id" 			: "nhl-sweatshirts",
					"link"			: "#!nhl-apparel/nhl-sweatshirts", 
					"img" 			: "9/93086_2",
					"name"			: "NHL Sweatshirts",
					"baseFilter" 	: { "and" : [ {"term" : {"prod_is_general" : "nhl_clothing"}} , {"term" : {"apparel_type" : "sweatshirts"}}]}
				}
			]
		},
		"test" : {
			"id" : "Test-Apparel",
			"page-title" : "Test Apparel at CampusColors.com",
			"page-description" : "Buy Test, because it is a test!",
			"pages" : [
				{
					"id" : "test-shorts",
					"link" : "#!test-apparel/test-shorts",
					"img" : "K/keyboard1",
					"name" : "Test Shorts",
					"baseFilter" : {"term" : {"tags" : "IS_BESTSELLER"}},
					"optionList" : [
						"zoovy:prod_name"
					]
				}
			]
		}
	},


////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\



	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).

				//if there is any functionality required for this extension to load, put it here. such as a check for async google, the FB object, etc. return false if dependencies are not present. don't check for other extensions.
				r = true;

				return r;
				},
			onError : function()	{
//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
//you may or may not need it.
						showContent('static',{'templateid':'splashPageTemplate','id':data.id,'dataset':_app.ext.store_cc.vars.test});
				_app.u.dump('BEGIN store_cc.callbacks.init.onError');
				}
			}, 
			
			addEventHandlers : {
				onSuccess : function() {
				
					_app.templates.homepageTemplate.on('complete.beachmall_carousel',function(event,$context,infoObj) {
						_app.ext.store_cc.u.runHomeCarousel($context);
					});
					
					_app.templates.filteredSearchTemplate.on('complete.store_cc',function(event,$context,infoObj) {
						dump('START filteredSearchTemplate.on complete'); dump(infoObj.loadFullList);
						$('form',$context).data('loadFullList', infoObj.loadFullList).trigger('submit');
					});
					
					
					function loadPage(id, successCallback, failCallback){
					var pageObj = _app.ext.store_filter.vars.filterPageLoadQueue[id];
//		dump('pageObj passed to loadPage in store_filter'); dump(pageObj);
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
//		dump('START showPage'); dump(routeObj);
					routeObj.params.templateid = routeObj.params.templateID || "filteredSearchTemplate";
//				dump(parentID);
					routeObj.params.dataset = $.extend(true, {}, $.grep(_app.ext.store_filter.filterData[parentID].pages,function(e,i){
						return e.id == routeObj.params.id;
					})[0]);
		dump('routeObj.params.dataset');  dump(routeObj.params.dataset.optionList);
					
					var optStrs = routeObj.params.dataset.optionList;
					routeObj.params.dataset.options = routeObj.params.dataset.options || {};
					for(var i in optStrs){
			dump('optStrs[i]'); dump(optStrs[i]);
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
					showContent('static',routeObj.params);
					}
					
					
					
					
					
					
					_app.router.addAlias('nhl-filter', function(routeObj){
		dump('ADD ALIAS filter callback routeObj'); dump(routeObj.params); 
			
					if(_app.ext.store_filter.filterData['nhl-apparel']){
						showPage(routeObj,'nhl-apparel');
						}
					else {
						loadPage(
							'nhl-apparel', 
							function(){showPage(routeObj,'nhl-apparel');}, 
							function(){showContent('404');}
							);
						}
					});
					
					_app.router.appendHash({'type':'exact','route':'nhl-apparel/', 'callback':function(routeObj){
						dump('In appendHash');
						_app.ext.store_cc.u.getCatJSON(routeObj.route);
					}});
					
					//Adds the listener for the url.  The route needs to match the page pushed into robots below
					_app.router.appendHash({'type':'match','route':'nhl-apparel/{{id}}','callback':'nhl-filter'});
					//This is the list of helmet pages.  The ID is part of the URL- change this for SEO reasons- the jsonPath is the file where it loads the options from.  The jsonPath doesn't matter as long as it loads the file
					var nhlPages = [
						{id:'nhl-apparel',jsonPath:'filters/apparel/nhl-apparel.json'}
					];
					for(var i in nhlPages) {
						_app.ext.store_filter.vars.filterPages.push(nhlPages[i]);
						//this page needs to match the route above
						_app.ext.seo_robots.vars.pages.push("#!filters/apparel/"+nhlPages[i].id+"/"); 
					}
					
					
			/*		_app.router.appendHash({'type':'exact','route':'nhl-apparel/', 'callback':function(routeObj){
						var data = _app.ext.store_cc.vars.nhl;
						showContent('static',{'templateid':'splashPageTemplate','id':data.id,'dataset':_app.ext.store_cc.vars.nhl});
					}});
					_app.router.appendHash({'type':'match','route':'nhl-apparel/{{filterid}}', 'callback':function(routeObj){
//						dump('{{filteriddump}} appendHash routeObj'); dump(routeObj);
						var data = $.grep(_app.ext.store_cc.vars.nhl.pages, function(e,i) {
//							dump('appendHash data & e: '); dump(e); 
							return e.id == routeObj.params.filterid;
						})[0];
						if(data) { 
//							dump('data2'); dump(data);
							showContent('static',{'templateid':'filteredSearchTemplate','id':data.id,'dataset':data});
						}
						else {
							showContent('404');
						}
					}});
					//TODO : PUSH TO ROBOTS... SOMEWHERE
					
					_app.router.appendHash({'type':'exact','route':'test-apparel/', 'callback':function(routeObj){
						var data = _app.ext.store_cc.vars.test;
						_app.ext.store_filter.filterData = _app.ext.store_cc.vars;
					}});
					_app.router.appendHash({'type':'match','route':'test-apparel/{{filterid}}', 'callback':function(routeObj){
						dump('{{filteriddump}} appendHash routeObj'); dump(routeObj);
						var data = $.grep(_app.ext.store_cc.vars.test.pages, function(e,i) {
							return e.id == routeObj.params.filterid; dump(e);	
						})[0];
						if(data) {
							showContent('static',{'templateid':'filteredSearchTemplate','id':data.id,'dataset':data});
						}
						else {
							showContent('404');
						}
					}});
				*/	
					
				},
				onError : function() {
					dump('START store_cc.callbacks.addEventHandlers.onError');
				}
			}
		}, //callbacks



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//actions are functions triggered by a user interaction, such as a click/tap.
//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
		a : {

			showScreenSize : function($container) {
				$(".text",$container.parent()).text(screen.width+"px");
			}
		
		}, //Actions

////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//renderFormats are what is used to actually output data.
//on a data-bind, format: is equal to a renderformat. extension: tells the rendering engine where to look for the renderFormat.
//that way, two render formats named the same (but in different extensions) don't overwrite each other.
		tlcFormats : {
			
			filterform : function(data, thisTLC) {
				var $context = data.globals.tags[data.globals.focusTag];
				
				var $fc = $('#filterContainer');
				var $fl = $('#filterList', $fc);
				$fl.removeData().empty();
				
				$fl.data('dataset',data.value);
				$fl.tlc({'dataset':data.value, 'templateid':'filterListTemplate'});
				$('button', $fl).button();
				
				$('form',$fl).data('jqContext',$context);
				
				//$('form', $fl).trigger('submit');
			}
			
		}, //tlcFormats
		
		
		renderFormats : {
		
			test : function($tag,data) {
				dump('TEST value:'); dump(data.value);
			},
			
			filtercheckboxlist : function($tag,data) {
				dump('START filtercheckboxlist');
				var options = false;
				if(data.bindData.index) {
					options = data.value[data.bindData.index];
				}
				
				if(options) {
					$tag.attr('data-filter-index', data.bindData.index);
					$tag.attr('data-filter-type','checkboxList');
					for(var i in options) {
						var o = options[i];
						var $o = $('<div></div>');
						$o.append('<input type="checkbox" name="'+o.v+'"/>');
						$o.append('<label>'+o.p+'</label>');
						$tag.append($o);
					}
				}
				else {
					$tag.remove();
				}
			},
			
			assigndata : function($tag, data) {
				$tag.data(data.bindData.attribute, data.value);
				//_app.u.dump($tag.data(data.bindData.attribute));
			}
			
		}, //renderFormats
			
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are exected by an event or action.
//any functions that are recycled should be here.
		u : {
		
			//for top level category (ie: nhl-apparel) will check if data object has been loaded in vars and show content w/ it if it has,
			//if not, will get data from the JSON record and showContent w/ that. Shows 404 if data can't be found in vars or JSON record.
			getCatJSON : function(route) {
				dump('START getCatJSON');
				var route = route.split('/')[0];
				if(_app.ext.store_cc.vars[route]) {
					dump('IT WAS ALREADY THERE...');
					showContent('static',{'templateid':'splashPageTemplate','id':data.id,'dataset':_app.ext.store_cc.vars[route]});
				}
				else {
					$.getJSON("filters/apparel/"+route+".json?_v="+(new Date()).getTime(), function(json){
						dump('THE CAT JSON IS...'); dump(json);
						showContent('static',{'templateid':'splashPageTemplate','id':json.id,'dataset':json});
					})
					.fail(function() {
						dump('FILTER DATA FOR ' + route + 'COULD NOT BE LOADED.');
						showContent('404');
					});
				}
			},
			
			//Turns best sellers ul on homepage into an auto scrolling carousel. 
			runHomeCarousel : function($context) {
//				_app.u.dump('----Running homepage carousels');	
				var $target = $('.homeCarousel',$context);
				if($target.data('isCarousel'))	{$target.trigger('play');} //only make it a carousel once, but make sure it always scrolls
				else {
					$target.data('isCarousel',true);
					//for whatever reason, caroufredsel needs to be executed after a moment.
					setTimeout(function(){
						$target.carouFredSel({
							responsive: true,
							auto: {	pauseOnHover: "immediate" },
							items : { "visible" : 4},
							width: '99%',
							//mousewheel: true, //this is mobile, so mousewheel isn't necessary (plugin is not loaded)
							swipe: { onMouse: true,	onTouch: true }
						}).parent().css('margin','auto');
					},2000); 
				} //HOMEPAGE best sellers CAROUSEL	
			},
			
		}, //u [utilities]

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
		
			newsletterSignup : function($ele, p) {
				p.preventDefault();
				var sfo = $ele.serializeJSON();
				sfo._cmd = "appBuyerCreate";
				sfo._tag = {
					datapointer :"appBuyerCreate",
					callback : function(rd){
						if(_app.model.responseHasErrors(rd)){
							$ele.anymessage({message:rd});
						}
						else {
							$ele.anymessage(_app.u.successMsgObject("Thank you, you are now subscribed"));
						}
					}
				}
				_app.model.addDispatchToQ(sfo, 'immutable');
				_app.model.dispatchThis('immutable');
			}
		
		} //e [app Events]
		
	} //r object.
	return r;
}
