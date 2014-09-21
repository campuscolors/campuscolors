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
	
	
	vars : {	},
	
	
////////////////////////////////////   CALLS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	
	calls : {
	
		appBuyerCreate : {
			init : function(obj,_tag)	{
				this.dispatch(obj,_tag);
				return 1;
			},
			dispatch : function(obj,_tag){
				obj._tag = _tag || {};
				obj._cmd = "appBuyerCreate";
				_app.model.addDispatchToQ(obj,'immutable');
			}
		}, //appBuyerCreate
		
	}, //calls


////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\



	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
				
				$.getJSON("_banners.json?_v="+(new Date()).getTime(), function(json) {
					_app.ext.store_cc.vars.homepageBanners = json.homepageBanners
				}).fail(function(){_app.u.throwMessage("BANNERS FAILED TO LOAD - there is a bug in _banners.json")});
				
				//if there is any functionality required for this extension to load, put it here. such as a check for async google, the FB object, etc. return false if dependencies are not present. don't check for other extensions.
				r = true;

				return r;
				},
			onError : function()	{
				//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
				//you may or may not need it.
				_app.u.dump('BEGIN store_cc.callbacks.init.onError');
				}
			}, 
			
			addEventHandlers : {
				onSuccess : function() {
				
					$.extend(handlePogs.prototype,_app.ext.store_cc.variations);

					_app.ext.store_cc.u.swipeMobileNav($(".mobileSlideMenu"));
					_app.ext.store_cc.u.runFooterCarousel();
					
					//make sure minicart stays up to date. 
					_app.ext.store_cc.vars.mcSetInterval = setInterval(function(){
						_app.ext.quickstart.u.handleMinicartUpdate({'datapointer':'cartDetail|'+_app.model.fetchCartID()});
					},4000);
				
					_app.templates.homepageTemplate.on('complete.store_cc',function(event,$context,infoObj) {
						$(".mobileSlideMenu.standardNav").addClass("hideOnHome");
						_app.ext.store_cc.u.showHomepageBanners();
						_app.ext.store_cc.u.runHomeCarousel($context);
					});
					
					_app.templates.homepageTemplate.on('depart.store_cc',function(event,$context,infoObj) {
						$(".mobileSlideMenu.standardNav").removeClass("hideOnHome");
					});
					
					_app.templates.filteredSearchTemplate.on('complete.store_cc',function(event,$context,infoObj) {
						dump('START filteredSearchTemplate.on complete'); dump(infoObj.loadFullList);
						$('form',$context).data('loadFullList', infoObj.loadFullList).trigger('submit');
					});
					
					_app.templates.productTemplate.on('complete.store_cc',function(event,$context,infoObj) {
						_app.ext.store_cc.u.showRecentlyViewedItems($context);
						_app.ext.store_cc.u.runPreviousCarousel($context);
					});
					
					_app.templates.productTemplate.on('depart.store_cc',function(event,$context,infoObj) {
						_app.ext.store_cc.u.addRecentlyViewedItems($context, infoObj.pid);
					});
					
					_app.templates.customerTemplate.on('complete.store_accountcreate',function(event,$context,infoObj) {
						var $sideline = $('[data-customer-sideline]', $context);
						if(infoObj.show == "createaccount") { $sideline.hide(); }
						else { $sideline.show(); }
					});
					
					
					function loadPage(id, successCallback, failCallback){
					var pageObj = _app.ext.store_filter.vars.filterPageLoadQueue[id];
//					dump('pageObj passed to loadPage in store_filter'); dump(pageObj);
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
					routeObj.params.loadFullList = _app.ext.seo_robots.u.isRobotPresent();
					showContent('static',routeObj.params);
					}
					
					
					
	//TODO : TEST PUSH TO ROBOTS @ THE END OF EACH APPENDhASH
					
//ALIAS					
					_app.router.addAlias('filter', function(routeObj){
						//decides if filter JSON is in local var or if it needs to be retrieved
						var filterpage = routeObj.pagefilter;
						if(_app.ext.store_filter.filterData[filterpage]){
							showPage(routeObj,filterpage);
						}
						else {
							loadPage(
								filterpage, 
								function(){showPage(routeObj,filterpage);}, 
								function(){showContent('404');}
							);
						}
					});
					
//APPEND
					//Adds the listener for the url.  The route needs to match the page pushed into robots below
					_app.router.appendHash({'type':'exact','route':'ncaa-apparel-merchandise/', 'callback':function(routeObj){
						_app.ext.store_cc.u.getCatJSON(routeObj.route);
					}});
					_app.router.appendHash({'type':'match','route':'ncaa-apparel-merchandise/{{id}}/','pagefilter':'ncaa-apparel-merchandise','callback':'filter'});
					_app.ext.store_cc.u.pushFilter('ncaa-apparel-merchandise');
					
					_app.router.appendHash({'type':'exact','route':'nfl-apparel-merchandise/', 'callback':function(routeObj){
						_app.ext.store_cc.u.getCatJSON(routeObj.route);
					}});
					_app.router.appendHash({'type':'match','route':'nfl-apparel-merchandise/{{id}}/','pagefilter':'nfl-apparel-merchandise','callback':'filter'});
					_app.ext.store_cc.u.pushFilter('nfl-apparel-merchandise');
					
					_app.router.appendHash({'type':'exact','route':'nba-apparel-merchandise/', 'callback':function(routeObj){
						_app.ext.store_cc.u.getCatJSON(routeObj.route);
					}});
					_app.router.appendHash({'type':'match','route':'nba-apparel-merchandise/{{id}}/','pagefilter':'nba-apparel-merchandise','callback':'filter'});
					_app.ext.store_cc.u.pushFilter('nba-apparel-merchandise');
					
					_app.router.appendHash({'type':'exact','route':'mlb-apparel-merchandise/', 'callback':function(routeObj){
						_app.ext.store_cc.u.getCatJSON(routeObj.route);
					}});
					_app.router.appendHash({'type':'match','route':'mlb-apparel-merchandise/{{id}}/','pagefilter':'mlb-apparel-merchandise','callback':'filter'});
					_app.ext.store_cc.u.pushFilter('mlb-apparel-merchandise');
					
					
					_app.router.appendHash({'type':'exact','route':'nhl-apparel-merchandise/', 'callback':function(routeObj){
						_app.ext.store_cc.u.getCatJSON(routeObj.route);
					}});
					_app.router.appendHash({'type':'match','route':'nhl-apparel-merchandise/{{id}}/','pagefilter':'nhl-apparel-merchandise','callback':'filter'});
					_app.ext.store_cc.u.pushFilter('nhl-apparel-merchandise');
					
					_app.router.appendHash({'type':'exact','route':'team-apparel-merchandise/', 'callback':function(routeObj){
						_app.ext.store_cc.u.getCatJSON(routeObj.route);
					}});
					_app.router.appendHash({'type':'match','route':'team-apparel-merchandise/{{id}}/','pagefilter':'team-apparel-merchandise','callback':'filter'});
					_app.ext.store_cc.u.pushFilter('team-apparel-merchandise');
					
					_app.router.appendHash({'type':'exact','route':'nike-gear/', 'callback':function(routeObj){
						_app.ext.store_cc.u.getCatJSON(routeObj.route);
					}});
					_app.router.appendHash({'type':'match','route':'nike-gear/{{id}}/','pagefilter':'nike-gear','callback':'filter'});
					_app.ext.store_cc.u.pushFilter('nike-gear');
					
					_app.router.appendHash({'type':'exact','route':'adidas-gear/', 'callback':function(routeObj){
						_app.ext.store_cc.u.getCatJSON(routeObj.route);
					}});
					_app.router.appendHash({'type':'match','route':'adidas-gear/{{id}}/','pagefilter':'adidas-gear','callback':'filter'});
					_app.ext.store_cc.u.pushFilter('adidas-gear');
					
					_app.router.appendHash({'type':'exact','route':'apparel/', 'callback':function(routeObj){
						_app.ext.store_cc.u.getCatJSON(routeObj.route);
					}});
					_app.router.appendHash({'type':'match','route':'apparel/{{id}}/','pagefilter':'apparel','callback':'filter'});
					_app.ext.store_cc.u.pushFilter('apparel');
					
					_app.router.appendHash({'type':'exact','route':'mens-apparel-merchandise/', 'callback':function(routeObj){
						_app.ext.store_cc.u.getCatJSON(routeObj.route);
					}});
					_app.router.appendHash({'type':'match','route':'mens-apparel-merchandise/{{id}}/','pagefilter':'mens-apparel-merchandise','callback':'filter'});
					_app.ext.store_cc.u.pushFilter('mens-apparel-merchandise');
					
					_app.router.appendHash({'type':'exact','route':'womens-apparel-merchandise/', 'callback':function(routeObj){
						_app.ext.store_cc.u.getCatJSON(routeObj.route);
					}});
					_app.router.appendHash({'type':'match','route':'womens-apparel-merchandise/{{id}}/','pagefilter':'womens-apparel-merchandise','callback':'filter'});
					_app.ext.store_cc.u.pushFilter('womens-apparel-merchandise');
					
					_app.router.appendHash({'type':'exact','route':'kids-apparel-merchandise/', 'callback':function(routeObj){
						_app.ext.store_cc.u.getCatJSON(routeObj.route);
					}});
					_app.router.appendHash({'type':'match','route':'kids-apparel-merchandise/{{id}}/','pagefilter':'kids-apparel-merchandise','callback':'filter'});
					_app.ext.store_cc.u.pushFilter('kids-apparel-merchandise');
					
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
			},

			showDropDown : function ($tag) {
				//_app.u.dump('showing');
				//console.log($tag.data('timeoutNoShow'));
				if(!$tag.data('timeoutNoShow') || $tag.data('timeoutNoShow')=== "false") {
					var $dropdown = $("[data-dropdown]", $tag);
					var height = 0;
					$dropdown.show();
					if($dropdown.data('height')){
						height = $dropdown.data('height');
					} else{
						$dropdown.children().each(function(){
								height += $(this).outerHeight();
						});
					}
					if($tag.data('timeout') && $tag.data('timeout')!== "false"){
						clearTimeout($tag.data('timeout'));
						$tag.data('timeout','false');
							
					}
					$dropdown.stop().animate({"height":height+"px"}, 500);
					if($tag.parent().hasClass("slideMenuBorder")) {
			//			$(".sprite", $tag).hide().addClass("openMenu").fadeIn(200);
						$(".sprite", $tag).addClass("openMenu");
					}
					return true;
				}
				return false;
			},
			
			showDropDownClick : function($tag){
				//_app.u.dump('showClick');
				if(this.showDropDown($tag)){
					$('[data-dropdown]',$tag).unbind('click');
					$('[data-dropdown]',$tag).click(function(event){event.stopPropagation()});
					$tag.attr('onClick','').unbind('click');
					setTimeout(function(){
						$('body').click(function(){
							_app.ext.store_cc.a.hideDropDownClick($tag);
						});
					}, 500);
				}
			},
			
			hideDropDown : function ($tag) {
				//_app.u.dump('hiding');
				$("[data-dropdown]", $tag).stop().animate({"height":"0px"}, 500);
				if($tag.data('timeout') && $tag.data('timeout')!== "false"){
					$tag.data('timeout')
					$tag.data('timeout','false');
				}
				$tag.data('timeout',setTimeout(function(){$("[data-dropdown]", $tag).hide();},500));
				if($tag.parent().hasClass("slideMenuBorder")) {
		//				$(".sprite", $tag).hide().removeClass("openMenu").fadeIn(200);
						$(".sprite", $tag).removeClass("openMenu");
					}
				return true;
			},
			
			hideDropDownClick : function($tag){
				//_app.u.dump('hideClick');
				if(this.hideDropDown($tag)){
					$tag.click(function(){_app.ext.store_cc.a.showDropDownClick($(this));});
					$('body').unbind('click');
				}
			},
			
			 hideDropDownOnSelect : function($tag){
				//dump('hideOnSelect');
				this.hideDropDownClick($tag);
				$tag.data('timeoutNoShow', setTimeout(function(){$tag.data('timeoutNoShow', 'false');}, 500));
			},
			
			hideMobileDropDownOnSelect : function($tag){
				dump('hideOnSelect');
				this.hideDropDownClick($tag);
				$('.mobileSlideMenu').animate({"left":"-275px"},500);
				$tag.data('timeoutNoShow', setTimeout(function(){$tag.data('timeoutNoShow', 'false');}, 500));
			},
			
			//toggles height on data-slide element within parent of the tag passed (made orig. for password recover, but could be used elsewhere).
			togglerecover : function($tag) {
				$("[data-slide='toggle']",$tag.parent()).slideToggle();
			}
		
		}, //Actions

////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//renderFormats are what is used to actually output data.
//on a data-bind, format: is equal to a renderformat. extension: tells the rendering engine where to look for the renderFormat.
//that way, two render formats named the same (but in different extensions) don't overwrite each other.
		tlcFormats : {
		
			//a testing function to show data bound to a tag
			dump : function(data,thisTLC) {
				dump("store_cc#dump");
				dump(data);
				return true;
			},
/* FILTER SEARCH TLC */			
			//adds filter data to the page form for filtering
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
			},
			
			filterrange : function(data, thisTLC){
				var args = thisTLC.args2obj(data.command.args, data.globals);
				if(typeof args.filterType === "undefined"){
					args.filterType = 'range';
					}
				if(args.index){
					
					var range = data.globals.binds[data.globals.focusBind];
					range.min = range.min || 0;
					range.step = range.step || 1;
					var $tag = data.globals.tags[data.globals.focusTag];

					$tag.attr('data-filter-index',args.index);
					$tag.attr('data-filter-type',args.filterType);
					
					$tag.slider({
						range : true,
						min : range.min,
						max : range.max,
						step : range.step,
						values : [range.min, range.max],
//passing $(this) seems wrong, was failing when tried to process JSON, uncomment when fixed, submitting w/ button still works.
// 						change : function(event, ui){_app.ext.store_filter.e.execFilteredSearch($(this), event);},
						slide : function(event, ui){$('.sliderVal', ui.handle).text(ui.value);},
						create : function(event, ui){
							$(this).find(".ui-slider-handle").each(function(i){
								var vals = $tag.slider('values');
								var $tooltip = $('<span class="sliderValContainer ui-state-default">$<span class="sliderVal">'+vals[i]+'</span></span>');
								$(this).append($tooltip);
								});
							}
						})
					}
				else {
					return false;
					}
				return true;
				},
/*PRODUCT LIST TLC*/			
			//adds show/hide to filter options. Will add to parent container if in mobile view, otherwise only to individual filters.
			//data-top indicates filter parent container. 
			//data-filterview indicates whether individual filter should start opened or closed, as well as current state for next click
			showmobilefilter : function(data, thisTLC) {
//				dump('START showMobileFilter');
				var $tag = data.globals.tags[data.globals.focusTag];
//				dump($tag.data('top'));
				if(screen.width > 767 && $tag.data('top') == 1) {
					// Dont hide all filter options if not mobile, just hide individual options. 
				}
				else {
					setTimeout(function() { //have to wait for form to load to get initial height
//						dump(screen.width);
							var $filter = $tag.data('top') == 1 ? $(".filterListTemplate",$tag.parent()) : $(".filterHider",$tag.parent());
							var currentHeight = $filter.outerHeight();
//							dump('-- current hieght:'); dump(currentHeight);
							if($tag.data('filterview') == 0) {
								$filter.css("height","0");
							}
							else { $tag.addClass('filterOpen'); }
							
							$tag.off('click').on('click',function() {
								var state = $tag.data('filterview');
								if (state == 0) {
									$filter.animate({'height':currentHeight},500);
									$tag.addClass('filterOpen');
									$tag.data('filterview',1);
								}
								else {
									$filter.animate({'height':'0px'},500);
									$tag.removeClass('filterOpen');
									$tag.data('filterview',0);
								}
							});
					},2000);
				}
			},
/* PRODUCT PAGE TLC */
			//add all the necessary fields for quantity inputs.
			atcquantityinput : function(data, thisTLC)	{
				var args = thisTLC.args2obj(data.command.args, data.globals);
				var $tag = data.globals.tags[data.globals.focusTag];
				var prod = data.globals.binds.var;
				var pid = prod.pid;
				var $input = $("<input class='displayNone' name='qty' \/>");
				var $select = $("<select class='qtySelect' \/>");
				var $selectWrapper = $("<div class='selectWrapper'></div>");

				if(_app.ext.store_product.u.productIsPurchaseable(data.globals.binds.var.pid)) {
					$input.attr({'size':3,'min':0,'step':1,'type':'number'}).addClass('numberInput').appendTo($tag);
					$input.on('keyup.classChange',function(){
						if(Number($(this).val()) > 0){$(this).addClass('qtyChanged ui-state-highlight');}
					});
					
						//a select list for qty selection is desired, let's build it...
					var $defaultOption = $("<option value='1' selected='selected'>1</option>");
					$defaultOption.appendTo($select);
						//check to see what max inventory is and set the number of options accordingly, default to 10 if inventory can't be obtained
					if(pid && prod['@inventory'] && prod['@inventory'][pid] && prod['@inventory'][pid].AVAILABLE)	{
						var qty = Number(prod['@inventory'][pid].AVAILABLE) + 1; //+1 to compensate count for first option which was created already
					}
					else {
						var qty = 11; 
					}
					if(qty > 1) { //only make additional options if the available qty is more than 1.
						for(var i = 2; i < qty; i++) {
							var $option = $("<option value="+i+">"+[i]+"</option>");
							$option.appendTo($select);
						}
					}
					
					//leaveing the default input field and changing that value to what is chosen in the select list is easier than rewriting 40 functions
					$select.change(function() {
						var selected = $(this).val();	//the option selected in select list
						$input.val(selected);				//now the default input has the select value and can still be used for handleaddtocart.
					});
					
					$select.appendTo($selectWrapper);
					$selectWrapper.appendTo($tag);
				}
				else	{
					$tag.hide(); //hide tag so any pre/post text isn't displayed. 
					$input.attr({'type':'hidden'}).appendTo($tag); //add so that handleaddtocart doesn't throw error that no qty input is present
				}
				//set this. because the name is shared by (potentially) a lot of inputs, the browser 'may' use the previously set value (like if you add 1 then go to another page, all the inputs will be set to 1. bad in a prodlist format)
				$input.val(args.defaultvalue || 0); 
			},
			
			getitwhileitlasts : function(data, thisTLC) {
				var $tag = data.globals.tags[data.globals.focusTag];
				var prod = data.globals.binds.var;
				var pid = prod.pid
				
				//dump("getItWhileItLasts"); dump(prod['@inventory']); dump(prod['@inventory'][pid].AVAILABLE);
				//some of this borrowed from store_product.renderformats.detailedinvdisplay
				if(pid && prod['@inventory'] && prod['@inventory'][pid] && prod['@inventory'][pid].AVAILABLE)	{
					var qty = prod['@inventory'][pid].AVAILABLE;
					if(qty < 10) {
						$(".addtocartbutton",$tag.parent()).addClass("orderSoon");
						$(".leftInStock",$tag).text("Only "+qty+" In Stock");
						$tag.show();
					}
					else { /*"There were more than enough to go around, no need for alarm.*/ }
					}
					
				/*not sure yet if this will be needed for our purposes...	
				else if(pid && prod['@inventory'])	{
					var inventory = prod['@inventory'],
					vlt = _app.ext.store_product.u.buildVariationLookup(prod['@variations']), //variation lookup table.
					$table = $("<table class='gridTable fullWidth marginBottom' \/>");
					$table.append("<thead><tr><th class='alignLeft'>Variation<\/th><th class='alignRight'>Inv. Available<\/th><\/tr>");
					for(var index in inventory)	{
//						var pretty = vlt[index.split(':')[1].substr[0,2]];
//						pretty += 
						$table.append("<tr><td>"+_app.ext.store_product.u.inventoryID2Pretty(index,vlt)+"<\/td><\/tr>");
						}
					$table.appendTo($tag);
					$table.anytable();
					}
				*/	
					
				else	{
					dump("Inventory could not be determined in store_cc.tlcFormat.getitwhileitlasts for "+pid);
					}
			},
			
/* CART TLC */
			//adds qty to cart item, but hides the field and adds a select list to use for changing the qty.
			//the input and the container the select list is added to must be children of the same container. 
			cartitemqty : function(data, thisTLC)	{
				var $tag = data.globals.tags[data.globals.focusTag];
				var prod = data.globals.binds.var;
				var $parent = ($tag.parent());
				var $select = $("<select class='qtySelect cartQtySelect' \/>");
				var $selectWrapper = $("[data-select-container]",$parent);
				dump('-----cartitemqty'); dump(prod);
				
		//		for(index in prod['%options']){
		//			dump('store_cc cartitemqty item inventory: '+prod['%options'][index].inv);
		//			var thisInventory = prod['%options'][index].inv;
		//		}
				
				$tag.val(prod.qty);
				
				//for coupons and assemblies, no input desired, but qty display is needed. so the qty is inserted where the input was.
				if((prod.stid && prod.stid[0] == '%') || prod.asm_master)	{
					$tag.prop('disabled',true).css('border-width','0')
					$("[data-cart-show='asm']",$parent).removeClass('displayNone');
					} 
				else	{
					$("[data-cart-show='select']",$parent).removeClass('displayNone');
					$tag.attr('data-stid',prod.stid);
					$tag.addClass('displayNone');
					
						//a select list for qty selection is desired, let's build it...
					for(var i = 1; i < 11; i++) {
						if(i == prod.qty) { var $option = $("<option value="+i+" selected='selected'>"+[i]+"</option>"); }
						else { var $option = $("<option value="+i+">"+[i]+"</option>"); }
						$option.appendTo($select);
					}
					
					//leaving the default input field and changing that value to what is chosen in the select list is easier than rewriting 40 functions
					$select.change(function() {
						var selected = $(this).val();	//the option selected in select list
						$tag.val(selected).change();				//now the default input has the select value and can still be used for handleaddtocart.
					});
					$parent.css({"position":"relative","top":"-7px"});
					$select.appendTo($selectWrapper);
					$selectWrapper.addClass('cartQtySelectWrapper');
				}
			},
			
		}, //tlcFormats
		
		
		renderFormats : {
		
			//a rebderformat for showing data bound to a tag
			test : function($tag,data) {
				dump('TEST value:'); dump(data.value);
			},
			
/* FILTER SEARCH RENDERFORMATS */			
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
			
			//adds base filter data to tag for use in filter search
			assigndata : function($tag, data) {
				$tag.data(data.bindData.attribute, data.value);
				//_app.u.dump($tag.data(data.bindData.attribute));
			}
			
		}, //renderFormats
			
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are exected by an event or action.
//any functions that are recycled should be here.
		u : {

/* FILTER SEARCH UTILS */		
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
			
			//saves filter to store_filter var, and pushes each page in the filter to robots
			pushFilter : function(endPath) {
				//This is the list of pages.  The ID (endPath) is part of the URL- change this for SEO reasons- the jsonPath is the file where it loads the options from.  The jsonPath doesn't matter as long as it loads the file
				//var nhlPages = [
				var Pages = [
					//{id:'nhl-apparel',jsonPath:'filters/apparel/nhl-apparel.json'}
					{id:endPath,jsonPath:'filters/apparel/'+endPath+'.json'}
				];
				for(var i in Pages) {
					_app.ext.store_filter.vars.filterPages.push(Pages[i]);
					//this page needs to match the route above
					_app.ext.seo_robots.vars.pages.push("#!filters/apparel/"+Pages[i].id+"/"); 
				}
			},
			
/* CAROUSEL UTILS */
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
							width	:"100%",
							items	: {
								minimum: 3,
								width : "80px"
							},
							scroll: {	fx: "directscroll"	},
							auto: {
								delay: 1000,
								pauseOnHover:"immediate"
							},
							swipe: { 
								onMouse: true,	
								onTouch: true 
							}
			/*				pagination: {
								container: ".page",
								keys: true
							},
							prev: {
								button: ".prev",
								key: "left"
							},
							next: {
								button: ".next",
								key: "right"
							}
			*/			});
					},2000); 
				} //HOMEPAGE best sellers CAROUSEL
			},
			
			//Turns top brands div in footer into an auto scrolling carousel.
			runFooterCarousel : function() {
				var $target = $('.footerTopBrandCar');
				if($target.data('isCarousel'))	{$target.trigger('play');} //only make it a carousel once, but make sure it always scrolls
				else {
					$target.data('isCarousel',true);
					//for whatever reason, caroufredsel needs to be executed after a moment.
					setTimeout(function(){
						$target.carouFredSel({
							width	:"100%",
							items	: {
								width : "100px"
							},
							scroll: {	fx: "directscroll"	},
							auto: {
								delay: 1000,
								pauseOnHover:"immediate"
							},
							swipe: { 
								onMouse: true,	
								onTouch: true 
							}
						});	
					},2000);
				} //FOOTER top brands carousel
			},
			
			//Turns previously viewed ul on product page into an auto scrolling carousel. 
			runPreviousCarousel : function($context) {
//				_app.u.dump('----Running product page previously viewed carousel');	
				var $target = $('.productPreviousViewed',$context);
				if($target.data('isCarousel'))	{$target.trigger('play');} //only make it a carousel once, but make sure it always scrolls
				else {
					$target.data('isCarousel',true);
					//for whatever reason, caroufredsel needs to be executed after a moment.
					setTimeout(function(){
						$target.carouFredSel({
							width	:"100%",
							items	: {
								minimum: 5,
								width : "80px"
							},
							scroll: {	items: 1, fx: "directscroll" },
							auto: {
								delay: 1000,
								pauseOnHover:"immediate"
							},
							swipe: { 
								onMouse: true,	
								onTouch: true 
							}
			/*				pagination: {
								container: ".page",
								keys: true
							},
							prev: {
								button: ".prev",
								key: "left"
							},
							next: {
								button: ".next",
								key: "right"
							}
			*/			});
					},2000); 
				} //PREVIOUSLY VIEWED CAROUSEL
			},
			
/* MOBILE UTILS */
			//applies a swipe to close mobile navigation window.
			swipeMobileNav : function($tag) {
				$tag.swipe( {
					//"swipe":function(event,direction,duration,fingerCount,fingerData) {
					"swipeLeft":function(event,direction,duration,fingerCount,fingerData) {
					dump('this worked');$(this).animate({"left":"-275px"},500);
					},
				//threshold:0 //default is 75px. Raise/lower to make more/less sensitive (0 for easy testing)
					});
			},
			
/* HOMEPAGE UTILS */
			showHomepageBanners : function() {
				var $container = $('#homepageTemplate_ .homeBanner');
				if(!$container.hasClass('bannersRendered')) {
					if(_app.ext.store_cc.vars.homepageBanners) {
						$container.addClass('bannersRendered');
						var bannerWidth = _app.ext.store_cc.vars.homepageBanners.main.width == "" ? 620 : _app.ext.store_cc.vars.homepageBanners.main.width;
						var bannerHeight = _app.ext.store_cc.vars.homepageBanners.main.height == "" ? 300 : _app.ext.store_cc.vars.homepageBanners.main.height;
						//dump('BANNER WIDTH & HEIGHT'); dump(bannerWidth); dump(bannerHeight);
						$container.removeClass('loadingBG').append(_app.ext.store_cc.u.makeBanner(_app.ext.store_cc.vars.homepageBanners.main,bannerWidth,bannerHeight,"ffffff"));
					}
					else {
						setTimeout(this.showHomepageBanners,250);
					}
				}
			},
			
			makeBanner : function(bannerJSON, w, h, b) {
				var $img = $(_app.u.makeImage({
					tag : true,
					w   	: w,
					h		: h,
					b		: b,
					name	: bannerJSON.src,
					alt		: bannerJSON.alt,
					title	: bannerJSON.title
				}));
				if(bannerJSON.href) {
					var $banner = $("<a></a>");
					$banner.append($img);
					$banner.attr('href',bannerJSON.href);
					return $banner;
				}
				else {
					//just a banner!
				}
				return $img;
			},
			
/* PRODUCT PAGE UTILS */
			//called on depart from prod page to add item to recently viewed items list
			//changed this from quickstart's addition at page load to prevent items from showing in list on first page visit
			addRecentlyViewedItems : function($context, pid) {
				dump('START addRecentlyViewedItems');
					//pid is infoObj.pid passed from onDeparts
				if($.inArray(pid,_app.ext.quickstart.vars.session.recentlyViewedItems) < 0)	{
					_app.ext.quickstart.vars.session.recentlyViewedItems.unshift(pid);
					}
				else	{
					//the item is already in the list. move it to the front.
					_app.ext.quickstart.vars.session.recentlyViewedItems.splice(0, 0, _app.ext.quickstart.vars.session.recentlyViewedItems.splice(_app.ext.quickstart.vars.session.recentlyViewedItems.indexOf(pid), 1)[0]);
					}
			},//addRecentlyViewedItems
				
				//populates carousel if items in recently viewed list, shows placeholder text if list empty
			showRecentlyViewedItems : function($context) {
				var $container = $('.productRecentCarousel', $context);
					dump('START showRecentlyViewedItems');
					//if no recently viewed items, tell them the sky is blue
				if(_app.ext.quickstart.vars.session.recentlyViewedItems.length == 0) {
					// $('.recentEmpty',$container).show(); //Use if contianer w/ empty message is desired. 
					dump('There aint nuthin in there ma!');
				}
					//otherwise, show them what they've seen
				else {
					$('.recentEmpty',$container).hide();
					$('.secTitleWrap',$container).show();
					$('ul',$container).empty(); //empty product list;
					$container.tlc({'dataset':_app.ext.quickstart.vars.session.recentlyViewedItems,verb:'translate'}); //build product list
					dump(_app.ext.quickstart.vars.session.recentlyViewedItems);
				}
			},//showRecentlyViewedItems
			
/* CREATE ACCOUNT UTILS */			
			handleAppLoginCreate : function($form)	{
				if($form)	{
					var formObj = $form.serializeJSON();
					
					if(formObj.pass !== formObj.pass2) {
						_app.u.throwMessage('Sorry, your passwords do not match! Please re-enter your password');
						return;
					}
					
					var tagObj = {
						'callback':function(rd) {
							if(_app.model.responseHasErrors(rd)) {
								$form.anymessage({'message':rd});
							}
							else {
								showContent('customer',{'show':'myaccount'});
								_app.u.throwMessage(_app.u.successMsgObject("Your account has been created!"));
							}
						}
					}
					
					formObj._vendor = "campuscolors";
					_app.ext.store_cc.calls.appBuyerCreate.init(formObj,tagObj,'immutable');
					_app.model.dispatchThis('immutable');
				}
				else {
					$('#globalMessaging').anymessage({'message':'$form not passed into store_cc.u.handleBuyerAccountCreate','gMessage':true});
				}
			}, //handleAppLoginCreate
			
		/*	This may be a better way to do this, but it doesn't work if the page isn't reloaded. If tablet goes from 
				portrait to landscape, the nav isn't hidden properly. Uses hideOnHome class for now.
			//top nav isn't shown on homepage for desktop. This hides it when hp is loaded, and shows when it's left.
			handleTopNav : function(state) {
				if(state == 'enter' && screen.width > 959) {
					$('.mobileSlideMenu.standardNav').fadeOut(500);
				}
				else { //if state != enter, it must be exit and you're leaving home.
					$('.mobileSlideMenu.standardNav').fadeIn(500);
				}
			}
		*/
		
		
		}, //u [utilities]

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
		
			//shows modal which contains form to e-mail current page to someone (see emailfriend)
			showemailfriend : function() {
				$parent = $('#emailAFriendTemplate');
				dump('--start showemailfriend');
				$parent.dialog({
					'modal':'true', 'title':'Sizing Guide','width':'60%', 'max-height':300,'dialogClass':'emailDialog',
					'open' : function(event, ui) { 
						$('.closeEmail','.emailDialog').on('click.closeModal', function(){$parent.dialog('close')});
						$('.ui-widget-overlay').on('click.closeModal', function(){$parent.dialog('close')});
					},
					'close': function(event, ui){ 
						$('.ui-widget-overlay').off('click.closeModal');
					}
				});
				$(".ui-dialog-titlebar").hide();
			},
		
			//processes e-mail page form and calls appMashUpRedis for it. Also needs appMashUpRedis-EMAILPAGE.json in the platform dir.
			emailfriend : function($form, p) {
				p.preventDefault();
				dump('-----start emailfriend...');
				var sender = $('input[name="youremail"]',$form).val();
				var recipient = $('input[name="theiremail"]',$form).val();
				var href = document.location.href;
				dump('emailfriend sender, recipient, & hash:'); dump(sender);  dump(recipient); dump(href);
				var params = {
					'_cartid' 	: _app.model.fetchCartID(),
					'platform' 	: 'appMashUpRedis-EMAILPAGE.json',
					'%vars' 	: {
						'sender'		: sender,
						'recipient'	: recipient,
						'href'			: href
					},
					'_cmd'		: 'appMashUpRedis',
					'_tag'		: {
						'callback':function(rd){
							if(_app.model.responseHasErrors(rd)) {
								$form.anymessage({'message':rd});
							}
							else {
								dump('emailfriend callback...'); dump(rd); 
								$form.anymessage(_app.u.successMsgObject("You've sent a link to "+recipient+" successfully!"));
//								_gaq.push(['_trackEvent','Cart','User Event','Cart e-mailed']);
//								window[_app.vars.analyticsPointer]('send', 'event','Checkout','User Event','Cart e-mailed');
							}
						}
					}
				};
				_app.model.addDispatchToQ(params,'immutable');
				_app.model.dispatchThis('immutable');
			},
		
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
			},
			
			//sets an element on the product page, in .prodViewerContainer, to scroll to the tab passed as data-scroll-tab
			scrollToRevealTab : function($ele, p) {
				p.preventDefault();
				var $context = $ele.closest('.prodViewerContainer');
				$("a[href="+$ele.data('scroll-tab')+"]",$context).trigger('click');
				$("html,body").animate( { scrollTop : $(".tabbedProductContent",$context).offset().top }, 750 );
			},
		
		}, //e [app Events]
		
/*
#######################

Variations

#######################
*/

		variations : {
			
			renderOptionSizeSELECT: function(pog) {
				dump('START renderOptionSizeSELECT for pog'); dump(pog);
				var pogid = pog.id;
				var $parentDiv = $("<span \/>");
				var $selectList = $("<select>").attr({"name":pogid});
				var i = 0;
				var len = $.isEmptyObject(pog['@options']) ? 0 : pog['@options'].length;

				var selOption; //used to hold each option added to the select
				var optionTxt;

				
			//if the option is 'optional' AND has more than one option, add blank prompt. If required, add a please choose prompt first.
				if(len > 0)	{
					optionTxt = (pog['optional'] == 1) ?  "" :  "Please choose (required)";
					selOption = "<option value='' disable='disabled' selected='selected'>"+optionTxt+"<\/option>";
					$selectList.append(selOption);
				}
			//adds options to the select list.
				while (i < len) {
					optionTxt = pog['@options'][i]['prompt'];
					if(pog['@options'][i]['p'])
						optionTxt += pogs.handlePogPrice(pog['@options'][i]['p']); //' '+pog['@options'][i]['p'][0]+'$'+pog['@options'][i]['p'].substr(1);
					selOption = "<option value='"+pog['@options'][i]['v']+"'>"+optionTxt+"<\/option>";
					$selectList.append(selOption);
					i++;
				}
				
				if(pogid === "SZ") {
					dump('OMG THE POG IS SZ');
					var $sizeDiv = $("<div></div>");
					var j = 0;
					while (j < len) {
						if(pog['@options'][j]['v']) {
							var pogval  = (pog['@options'][j]['v']);
							dump(pogval);
							var $sizeOption = $("<span class='sizeOption pointer' data-pogval='"+pogval+"'></span>");
							$sizeOption.text(pogval);
							$sizeOption.click(function() {
								var $this = $(this);
								var thisSelection = $this.attr('data-pogval');
								$selectList.val(thisSelection);
								dump('You have clicked on '+$this.attr('data-pogval')+' good sir');
								$('span',$sizeDiv).each(function() {
									if($(this).hasClass('selectedSize')) $(this).removeClass('selectedSize').addClass('pointer');
									if($(this).attr('data-pogval') == thisSelection) $(this).addClass('selectedSize').removeClass('pointer');
								});
							}); 
							$sizeOption.appendTo($sizeDiv);
						} 
						j++;
					}
					$sizeDiv.appendTo($parentDiv);
					$selectList.addClass('displayNone');
				}

			//	dump(" -> pogid: "+pogid);
			//	dump(" -> pog hint: "+pog['ghint']);
				$selectList.appendTo($parentDiv);
				if(pog['ghint']) {$parentDiv.append(pogs.showHintIcon(pogid,pog['ghint']))}
				return $parentDiv;
			}, //
			
			xinit : function(){
				this.addHandler("type","select","renderOptionSizeSELECT");
				_app.u.dump("--- RUNNING XINIT");
			}
			
		} //variations
		
	} //r object.
	return r;
}
