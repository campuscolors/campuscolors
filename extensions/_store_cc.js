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
					_app.ext.store_cc.vars.homepageBanners = json;
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
					var screenWidth = screen.width;
					$dropdown.show();
					if($dropdown.data('desk-height') && screenWidth > 959){
						height = $dropdown.data('desk-height');
					} 
					else if($dropdown.data('tab-height') && screenWidth < 960 && screenWidth > 767) {
						height = $dropdown.data('tab-height');
					}
					else if($dropdown.data('mobile-height') && screenWidth < 768) {
						height = $dropdown.data('mobile-height');
					}
					else if($dropdown.data('height')){
						height = $dropdown.data('height');
					}
					else{
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
					$('[data-dropdown]',$tag).off('click.dropdown');
					$('[data-dropdown]',$tag).on('click.dropdown',function(event){event.stopPropagation()});
					$tag.attr('onClick','').off('click.dropdown');
					setTimeout(function(){
						$('#appView').off('click.dropdown').on('click.dropdown',function() {
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
					$tag.on('click.dropdown',function(){_app.ext.store_cc.a.showDropDownClick($(this));});
					$('#appView').off('click.dropdown');
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
				return true;
			},
			
			hideOnLink : function($tag) {
				$("[data-desk-drop]").each(function(){
					_app.ext.store_cc.a.hideDropDownClick($(this));
				});
			}, 
			
			//toggles height on data-slide element within parent of the tag passed (made orig. for password recover, but could be used elsewhere).
			togglerecover : function($tag) {
				$("[data-slide='toggle']",$tag.parent()).slideToggle();
				$tag.parent().toggleClass('open');
			},
			
			showDropOut : function ($tag) {
				//_app.u.dump('showing');
				//console.log($tag.data('timeoutNoShow'));
				if(!$tag.data('timeoutNoShow') || $tag.data('timeoutNoShow')=== "false") {
					var $dropout = $("[data-dropout]", $tag);
					var width = 0;
					$dropout.show();
					if($dropout.data('width')){
						if(screen.width < 1080 && screen.width > 959) { width = $dropout.data('low-width'); }
						else if(screen.width < 960) { width = $dropout.data('tab-width'); }
						else { width = $dropout.data('width'); }
						dump(width);
						//width = screen.width < 1080 ?  $dropout.data('low-width') : $dropout.data('width');
					} else{
						$dropout.children().each(function(){
								width += $(this).outerWidth();
						});
					}
					if($tag.data('timeout') && $tag.data('timeout')!== "false"){
						clearTimeout($tag.data('timeout'));
						$tag.data('timeout','false');
							
					}
					if($dropout.data('height')) {
						var height = 0;
						if(screen.width < 1080 && screen.width > 959) { height = $dropout.data('low-height'); }
						else if(screen.width < 960) { height = $dropout.data('tab-height'); }
						else { height = $dropout.data('height'); }
						$('.scrollDropout',$tag).css('height',height+"px");
					}
					$dropout.stop().animate({"width":width+"px"}, 500);
					return true;
				}
				return false;
			},
			
			hideDropOut : function ($tag) {
				//_app.u.dump('hiding');
				$("[data-dropout]", $tag).stop().animate({"width":"0px"}, 500);
				if($tag.data('timeout') && $tag.data('timeout')!== "false"){
					$tag.data('timeout')
					$tag.data('timeout','false');
				}
				$tag.data('timeout',setTimeout(function(){$("[data-dropout]", $tag).hide();},500));
				$('.scrollDropout',$tag).css('height',"auto");
				return true;
			},
			
			//guest/user checkout buttons need to be switched on logout from within checkout or they are backwards (showing "checkout as guest" when should be "user")
			manualToggle : function() {
				if($("[data-checkout-type='guest']","#checkoutContainer").css("opacity") == 1) {
					setTimeout(function(){$("input[name='want/sign_in']","#checkoutContainer").trigger("click");},1000); //needed timeout for buttons to be accessable again
				}
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
						change : function(event, ui){_app.ext.store_filter.e.execFilteredSearch($(this).closest('form'), event);},
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
				
				filterrangebox : function(data, thisTLC){
				var args = thisTLC.args2obj(data.command.args, data.globals);
				if(typeof args.filterType === "undefined"){
					args.filterType = 'rangebox';
					}
				if(args.index){
					
					var range = data.globals.binds[data.globals.focusBind];
					range.min = range.min || 0;
					range.step = range.step || 1;
					var $tag = data.globals.tags[data.globals.focusTag];

					$tag.attr('data-filter-index',args.index);
					$tag.attr('data-filter-type',args.filterType);
					$tag.attr('data-values',range.min+"|"+range.max);
					
					dump(range.min); dump(range.max); dump(range.min+"|"+range.max);
					
					$('[data-price]',$tag).each(function() {
						$(this).on('change',function(event) {
							if($(this).prop('checked') === true) {
								$tag.attr('data-values',$(this).data('price'));
								$('[data-price]',$tag).each(function(){ $(this).removeClass('active') });
								$(this).addClass('active');
								$('[data-price]',$tag).each(function(){ if(!$(this).hasClass('active')) { $(this).prop('checked',false) } });
							}
							else {
								$('[data-price]',$tag).each(function(){ $(this).removeClass('active') });
								$tag.attr('data-values',range.min+"|"+range.max);
							}
							_app.ext.store_filter.e.execFilteredSearch($(this).closest('form'), event);
							dump('you clicked the option w/ price: '); dump($(this).data('price'));
						});
					});

				}
				else {
					return false;
					}
				return true;
				},
				
				addbreadcrumb : function(data, thisTLC) {
//					dump('START addbreadcrumb');  dump(_app.ext.quickstart.vars.hotw);
					var $tag = data.globals.tags[data.globals.focusTag];
					var bc = data.globals.binds.bc; //dump(bc); 
					var $bread = $("<div></div>");
					var L = bc.length
					$tag.empty(); //be sure there are no crumbs in the bed
					
					//check hotw to see if home could have been visited since root cat, if so add a link for it
					for (var j = 1; j < 4; j++) {
//						dump('HOTW '+j+' ='); dump(_app.ext.quickstart.vars.hotw[j]);
						if(_app.ext.quickstart.vars.hotw[j] && _app.ext.quickstart.vars.hotw[j].pageType  == "homepage") {
							if(!$bread.data("home-added")) {
								$bread.append($("<a href='/'>Home</a><span class='crumbTween'> &#62; </span>"));
								$bread.data("home-added");
							}
							else { /* Home has already been added, so don't put more than one */ }
						}
					}
					
					for(var i = 0; i < L; i++) {
//					dump('------this turn = '); dump(i);
						if(i == L-1) {
							$bread.append($("<span class='crumbLeaf'>" + bc[i] + "</span>")); //<span class='crumbTween'>You are in&#58; </span>
						}
						else {
							var $crumb = $("<a></a>");
							if(i == 0) { $crumb.text(bc[i]).attr("href","/" + bc[i].toLowerCase() + "/"); }
							else { $crumb.text(bc[i]).attr("href","/" + bc[0].toLowerCase() +"/"+ bc[i].toLowerCase() + "/"); }
							$bread.append($crumb);
							$bread.append("<span class='crumbTween'> &#62; </span>"); 
						}
					}

					$tag.append($bread);
				}, //addbreadcrumb
				
				//adds type links (shorts, shirts, etc.) to bottom of product lists to allow crawlers to get to the type pages for each.
				//this is because there are typically no links to them anywhere else. 
				addbotlinks : function(data,thisTLC) {
					var hash = data.globals.binds.var.link; //dump(hash); 
					if(hash && (hash.indexOf("team") != -1 || hash.indexOf("league") != -1)) {
						var $tag = data.globals.tags[data.globals.focusTag];
						var deezEnds = ["all","shorts","t-shirts","sweatshirts","jerseys","pants","hats","novelties-and-accessories"]
						var hashArray = hash.split("/")
//						dump('hashArray'); dump(hashArray);
						var thisEnd = hashArray[hashArray.length-2];
						var thisTeam = hashArray[hashArray.length-3];
						var newHash = "";
						
//						dump('botlinks league deezEnds hashArray thisEnd thisTeam'); dump(deezEnds); dump(hashArray); dump(thisEnd); dump(thisTeam);
 						//no need to show a link to the current page on the current page, remove it's end from the array.
						if($.inArray(thisEnd, deezEnds) >= 0) {
							deezEnds.splice($.inArray(thisEnd, deezEnds),1);
						}
//						dump(deezEnds);
						
						for(var i = 0; i < hashArray.length-2; i++) {
							newHash += hashArray[i] + "/";
						}

						for(var j = 0; j < deezEnds.length; j++) {
							var $a = $("<a class='botLink'></a>");
//							dump(deezEnds[j]);
							if(deezEnds[j] == "all") { $a.text(_app.ext.store_cc.u.uppercaseFirst(deezEnds[j]) + " " + _app.ext.store_cc.u.uppercaseFirst(thisTeam)); }
							else if (deezEnds[j] == "novelties-and-accessories") { $a.text("Novelties & Accessories") }
							else { $a.text(_app.ext.store_cc.u.uppercaseFirst(deezEnds[j])); }
							var thishref = newHash + deezEnds[j]+"/";
							$a.attr('href',thishref);
							$tag.append($a);
						}
					}
				},
				
/*PRODUCT LIST TLC*/	
			//adds link to leaf level of root category in order to bypass the standard "type" subcategory.
			makelinkall : function(data, thisTLC) {
				var $tag = data.globals.tags[data.globals.focusTag];
				var id = data.globals.binds.id; //dump(id); 
				var href = data.globals.binds.href; //dump(href);
				var link = href.split("/")[1];
				//root category lists for these categories need to direct to all of the product for their team/league so alter the link on the li if they match. 
				if(link === "league-apparel-merchandise" || link === "ncaa-team-apparel-merchandise" || link === "nba-team-apparel-merchandise" || link === "mlb-team-apparel-merchandise" || link === "nhl-team-apparel-merchandise" || link === "soccer-team-apparel-merchandise" || link === "nfl-team-apparel-merchandise") {	
					href = href + "all/";
				}
				$tag.attr("href",href);
			},
			
			//adds/removes class to allow css animation to show/hide each filter option.
			//if the class is present the click will remove, and vice versa. 
			//Add the class in the template to begin w/ the filter open, don't add to begin with the filter closed. 
			showfilter : function(data,thisTLC) {
				var $tag = data.globals.tags[data.globals.focusTag];
				var $filter = $tag.parent();
				
				$tag.off('click').on('click',function() {
					if($filter.hasClass('filterOpen')) {
						$filter.removeClass("filterOpen"); //closed when class is removed
					}
					else {
						$filter.addClass("filterOpen"); //open when class is removed
					}
				});
			},
			
			//adds/removes class to allow css animation to show/hide all filter options. Used for phone only.
			//data-parent-filter-hider indicates filter parent container. 
			showmobilefiltercontainer : function(data,thisTLC) {
				var $tag = data.globals.tags[data.globals.focusTag];
				var $filter = $("[data-parent-filter-hider]",$tag.parent())
				
				if(screen.width < 767) {
					// Dont hide all filter options if not mobile, just hide individual options. 
					$tag.removeClass("openFilters");
					$filter.removeClass("openFilters");
				}
				$tag.off('click').on('click',function() {
					if($filter.hasClass('openFilters')) {
						$tag.removeClass("openFilters");
						$filter.removeClass("openFilters"); //the class that does the magic
					}
					else {
						$tag.addClass("openFilters");
						$filter.addClass("openFilters"); //the class that does the magic
					}
				});
			},
	
/*	
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
*/			
/* PRODUCT PAGE TLC */
			//add team logo and link to all products for said team under the main product image
			teamupsell : function(data,thisTLC) {
				var $tag = data.globals.tags[data.globals.focusTag];
				var prod = data.globals.binds.var;
				var teamCode = prod['%attribs']['user:team_code'];
				var teamLong = prod['%attribs']['user:team_long'];
				var imgSrc = "teamlogos/" + teamCode + ".jpg";
				var imgAlt = prod['%attribs']['user:team_long'] + " logo";
				var league = prod['%attribs']['user:team_league'];
				var href = "/" + league + "-team-apparel-merchandise/" + teamLong.split(" ").join("-") + "/all/";
				var $imgA = $("<a href='"+href+"'></a>");
				var $img = $(_app.u.makeImage( {"tag" : true, "w" : 60, "h" : 60, "b" : 'ffffff', "name" : imgSrc, "alt"	: imgAlt, "title" : imgAlt} ));
				
				$('a',$tag).attr("href",href).text(_app.ext.store_cc.u.uppercaseFirst(teamLong));
				$imgA.prepend($img);
				$tag.prepend($imgA);
				$tag.show();
			},
			
			//add all the necessary fields for quantity inputs.
			atcquantityinput : function(data, thisTLC)	{
				var args = thisTLC.args2obj(data.command.args, data.globals);
				var $tag = data.globals.tags[data.globals.focusTag];
				var prod = data.globals.binds.var;
				var pid = prod.pid;
				var $input = $("<input class='displayNone' name='qty' \/>");
				var $qty = $("<div class='qtyDesc floatLeft'>Qty: </div>");
				var $select = $("<select class='qtySelect' data-select='qty' \/>");
				var $selectWrapper = $("<div class='selectWrapper floatLeft'></div>");
				var variations = prod['@variations'];

				if(_app.ext.store_product.u.productIsPurchaseable(data.globals.binds.var.pid)) {
					$input.attr({'size':3,'min':0,'step':1,'type':'number'}).addClass('numberInput').appendTo($tag);
					$input.on('keyup.classChange',function(){
						if(Number($(this).val()) > 0){$(this).addClass('qtyChanged ui-state-highlight');}
					});
						
					//if there aren't any variations there will only one inventory qty to deal w/, build the select here
					if(!variations.length) {
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
					}
						
					//but if there are variations, each will have an inventory to consider. build a placeholder select list that gets rebuilt w/ correct qty once a variation is selected.
					else	{
						var $defaultOption = $("<option value='' selected='selected'>-</option>");
						$defaultOption.appendTo($select);
						$select.off('click').on('click',function(){ $tag.closest('form').anymessage({"message":"Please select a size first."}); });
					}
						
					$select.appendTo($selectWrapper);
					$qty.appendTo($tag);
					$selectWrapper.appendTo($tag);
				}
				else	{
					$tag.hide(); //hide tag so any pre/post text isn't displayed. 
					$input.attr({'type':'hidden'}).appendTo($tag); //add so that handleaddtocart doesn't throw error that no qty input is present
				}
				//set this. because the name is shared by (potentially) a lot of inputs, the browser 'may' use the previously set value (like if you add 1 then go to another page, all the inputs will be set to 1. bad in a prodlist format)
				$input.val(args.defaultvalue || 0); 
			},
			
	//ACTION FOR THIS FUNCTION MOVED INTO buildThisQty, CAN BE REMOVED ONCE CONFIRMED IT'S NO LONGER NEEDED.
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
			
			relatedproducts : function(data,thisTLC){
				dump('START store_cc.tlc.relatedproducts');
				 
				var team, attrib;
				if(data.value['%attribs']['user:team_league_nfl']) { team = data.value['%attribs']['user:team_league_nfl']; attrib = 'team_league_nfl'; }
				else if(data.value['%attribs']['user:team_league_ncaa']) { dump(data.value['%attribs']['user:team_league_ncaa']); team = data.value['%attribs']['user:team_league_ncaa']; attrib = 'team_league_ncaa'; }
				else if(data.value['%attribs']['user:team_league_nba']) { team = data.value['%attribs']['user:team_league_nba']; attrib = 'team_league_nba'; }
				else if(data.value['%attribs']['user:team_league_mlb']) { team = data.value['%attribs']['user:team_league_mlb']; attrib = 'team_league_mlb'; }
				else if(data.value['%attribs']['user:team_league_nhl']) { team = data.value['%attribs']['user:team_league_nhl']; attrib = 'team_league_nhl'; }
				else { /* NO TEAM, NO LIST TO SHOW */}
				 
				if(team && attrib){
					var lt = data.value['%attribs']['zoovy:prod_name'];
					lt += " "+data.value['%attribs']['zoovy:keywords'];
					lt += " "+data.value['%attribs']['zoovy:prod_desc'];
					var search = {
						"query" : {
							"filtered" : {
								"query" : {
									"more_like_this" : {
										"fields" : ["prod_name", "keywords", "description"],
										"like_text" : lt
									}
								},
								"filter" : {
									//added dynamically later
								}
							}
						}
					}
				  
					// Order specified by the client
					var types = [
						'shorts', 't-shirts', 'sweatshirts', 'pants', 'hats', 'jerseys', 'novelties & accessories'
					];
					//remove the product type that we already have
					if($.inArray(data.value['%attribs']['user:website_filter'], types) >= 0) {
						types.splice($.inArray(data.value['%attribs']['user:website_filter'], types),1);
					}
				  
					for(var i in types){
						var thisSearch = $.extend(true, {}, search);

						//added individually to avoid pass-by-reference bugs- deep copies only copy pointers to arrays and objects
						thisSearch.query.filtered.filter.and = [];
						//Filter by team
						thisSearch.query.filtered.filter.and.push({"term" : {}});
						thisSearch.query.filtered.filter.and[0].term[attrib] = team; 
						//Filter by type
						thisSearch.query.filtered.filter.and.push({"term" : {"website_filter":types[i]}});
						thisSearch.query.filtered.filter.and.push({"has_child":{"type":"sku","query": {"range":{"available":{"gte":1}}}}});  //only return item w/ inventory

						var _tag = {
							"datapointer" : "related-"+types[i]+"|"+data.value.pid
						};

						var es = _app.ext.store_search.u.buildElasticRaw(thisSearch);
						es.size = 4;
						_app.ext.store_search.calls.appPublicSearch.init(es, _tag, 'immutable');
					}
					//Add a ping with the callback at the end, since we have multiple searches going out.
					var _tag = {
						"callback" : function(rd){
							var prods = [];
							var pass = 0;
							while(prods.length < 4 && pass < 4) {
								for(var i in types) {
									var d = _app.data["related-"+types[i]+"|"+data.value.pid];
									if(prods.length  >= 4) {
										break;
									}
									else if(d && d.hits && d.hits.hits && d.hits.hits[pass]) {
										prods.push(d.hits.hits[pass]);
									}
								}
								pass++;
							}
							if(prods.length == 0) { 
								rd.jqObj.parent().hide();
								rd.jqObj.empty().remove(); 
							}
							for(var i in prods) {
								var $p = new tlc().getTemplateInstance('productListTemplateResultsNoPreview');
								$p.tlc({'verb':'translate','dataset':prods[i]["_source"]});
								rd.jqObj.append($p);
							}
						},
						"jqObj" : data.globals.tags[data.globals.focusTag]
					}
					_app.model.addDispatchToQ({
						"_cmd" : "ping",
						"_tag" : _tag
					},'immutable');
					_app.model.dispatchThis('immutable');  
				}
				return true;
			},
						
/* CART TLC */
			tillfreeship : function(data, thisTLC) {
				var $tag = data.globals.tags[data.globals.focusTag];
				var itemsTotal = data.globals.binds.var;
				
				if(itemsTotal < 75) { 
					var diff = 75 - itemsTotal;
					diff = _app.u.formatMoney(diff,'','','');
					//_app.u.formatMoney(amount,data.bindData.currencySign,'',data.bindData.hideZero);
					$tag.text("Add $"+diff+" more for FREE SHIPPING!"); 
				}
				else if (itemsTotal >= 75) { $tag.text("You qualify for FREE SHIPPING!"); }
				else { 
					/* catch in case itemsTotal is somehow undef or null, show no message in the cart in that case */ 
					dump('In store_cc#tillFreeShip and the total for the items in the cart did not fall above or below the free shipping threshold... that should be investigated.');
				}
			},
			
			searchbytag : function(data,thisTLC) {
				var path = data.globals.binds.var;
				$.getJSON("filters/search/"+path+".json?_v="+(new Date()).getTime(), function(json){
					dump('THE SEARCH JSON IS...'); dump(json);
					var dataset = $.extend(true, {}, $.grep(json.pages,function(e,i){
						return e.id == b;
					})[0]);
//					dump('GREP IS: '); dump(dataset);
					dataset.breadcrumb = [routeObj.pagefilter,routeObj.params.id]
					showContent('static',{'templateid':'splashPageTemplate','id':routeObj.params.id,'dataset':dataset});
				})
				.fail(function() {
					dump('FILTER DATA FOR ' + a + 'COULD NOT BE LOADED.');
					showContent('404');
				});
/*
				var argObj = thisTLC.args2obj(data.command.args,data.globals); //this creates an object of the args
					//check if there is a $var value to replace in the filter object (THERE IS PROBABLY A BETTER WAY TO DO THIS)
				if(argObj.replacify) {argObj.filter = argObj.filter.replace('replacify',data.value);}
	//			dump(argObj.replacify);
				var query = JSON.parse(argObj.filter);
	//	dump('----search by tag'); dump(data.value); dump(argObj.filter); dump(query);
				_app.ext.store_search.calls.appPublicProductSearch.init(query,$.extend({'datapointer':'appPublicSearch|tag|'+argObj.tag,'templateID':argObj.templateid,'extension':'store_search','callback':'handleElasticResults','list':data.globals.tags[data.globals.focusTag]},argObj));
				_app.model.dispatchThis('mutable');
				return false; //in this case, we're off to do an ajax request. so we don't continue the statement.
		*/	},
		
			toggleguestcheckout : function(data,thisTLC) {
				var $tag = data.globals.tags[data.globals.focusTag];
				var $button = $("[data-checkout-type='button']",$tag);
				var $form = $tag.closest('form');
				
				switch($tag.data("checkout-type")) {
					case "guest" :
						$button.off('click').on('click',function() {
							dump('toggleguestcheckout guest was clicked'); //dump(thisData);
							$("[data-checkout-type='guest']",$form).animate({"opacity":0},function(){
								$(this).hide()
								$("[data-checkout-type='user']",$form).show().animate({"opacity":1});
							});
							$('input[name="want/sign_in"]',$form).trigger("click");
							_app.ext.order_create.u.handlePanel($form,'chkoutPreflight',['handleDisplayLogic']);
						});
						break;
					case "user" :
						$tag.off('click').on('click',function() {
							dump('toggleguestcheckout user was clicked'); //dump(thisData);
							$("[data-checkout-type='user']",$form).animate({"opacity":0},function(){
								$(this).hide()
								$("[data-checkout-type='guest']",$form).show().animate({"opacity":1});
							});
							$('input[name="want/sign_in"]',$form).trigger("click");
						});
					break;
					default :
					dump("Translation type could not be determined in store_cc toggleguestcheckout"); 
				}
				
				
			//	$fl.tlc({'dataset':data.value, 'templateid':'filterListTemplate'});
			// $p.tlc({'verb':'translate','dataset':prods[i]["_source"]});
			},
			
			chkoutadduser : function(data,thisTLC) {
				var user = data.globals.binds.var;
				dump('START chkoutadduser'); 
				$('.username').empty().text(user);
				dump(user);
			},
			
			regionsasoptions : function(data, thisTLC)	{
				var entireCart = data.globals.binds.var;
				var $tag = data.globals.tags[data.globals.focusTag];
//				dump('START regionsasoptions'); dump(entireCart);
				var r = '', regions = [], cartid;
				var name = $tag.attr('name');
				
				if(entireCart.cart && entireCart.cart.cartid){
					cartid = entireCart.cart.cartid;
					}
				else	{
					cartid = _app.model.fetchCartID(); //in some cases, such as an address editor, the cartid may not be in the data.
					}
				if(cartid) {
					//get the regions
					$.getJSON("_regions.json?_v="+(new Date()).getTime(), function(json){
//						dump('THE REGIONS JSON IS...'); dump(json);
						for(var i = 0; i < json.length; i += 1)	{
							//if the region is already in cart, make that the selection in the select list (but seperately for bill and ship).
							if(name == 'bill/region') {			
								if(_app.data['cartDetail|'+cartid] && _app.data['cartDetail|'+cartid].bill && _app.data['cartDetail|'+cartid].bill.region && (json[i].val == _app.data['cartDetail|'+cartid].bill.region)) {
									r += "<option selected value='"+json[i].val+"'>"+json[i].id+"</option>";
								}
								else { r += "<option value='"+json[i].val+"'>"+json[i].id+"</option>"; }
							}
							else {
								if(_app.data['cartDetail|'+cartid] && _app.data['cartDetail|'+cartid].ship && _app.data['cartDetail|'+cartid].ship.region && (json[i].val == _app.data['cartDetail|'+cartid].ship.region)) {
									r += "<option selected value='"+json[i].val+"'>"+json[i].id+"</option>";
								}
								else { r += "<option value='"+json[i].val+"'>"+json[i].id+"</option>"; }
							}
						}
						$tag.append(r);
					})
					.fail(function() {
						//if the json for the regions can't be loaded, show the default text field as a backup. 
						dump('FILTER DATA FOR REGIONS COULD NOT BE LOADED.');
						$("input",$tag.parent()).show().attr('required','required').attr('name',name);
						$tag.remove();
					});
				}
				else	{ dump("For regionsasoptions tlcFormat in store_cc, cartID could not be obtained.",'warn'); }
			},
			
			//gathers params for google remarketing tag. Google needs cart  as pagetype for both cart and checkout,
			//remarket-context attrib differentiates the page for the addRemarketing function.
			cartremarket : function(data, thisTLC) {
				var cartItems = data.globals.binds.var;
//				dump('START store_cc.tlcFormats.cartremarket'); dump(cartItems);
				var $tag = data.globals.tags[data.globals.focusTag];
				var stid = [];
				var toteval = 0;
				for(index in cartItems) {
					if(cartItems[index].extended) { toteval += parseFloat(cartItems[index].extended); }
					if(cartItems[index].stid) { stid.push(cartItems[index].stid); }
//					dump(cartItems[index].extended); dump(cartItems[index].stid);
				}
				var gTagParams = {"ecomm_prodid":"","ecomm_pagetype":$tag.attr("data-remarket-page"),"ecomm_totalvalue":0};
				if(stid.length) gTagParams.ecomm_prodid = stid.length > 1 ? stid : stid[0];
				gTagParams.ecomm_totalvalue = toteval;
				_app.ext.store_cc.u.addRemarketing(gTagParams);
//				dump(gTagParams.ecomm_pagetype); dump(gTagParams.ecomm_prodid); dump(gTagParams.ecomm_totalvalue);
			}
				
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
			
			//adds an iframe with the google remarketing script and vars for pages
			addRemarketing : function(gTagParams) {
//				dump('START store_cc.u.addRemarketing'); dump(gTagParams);
				//remove any remarketing that may be left over from previous pages
				$("[data-cc-remarketing='params']","body").remove();
				$("[data-cc-remarketing='cdata']","body").remove();
		//		$("[data-cc-remarketing='conversion']","body").remove();
	
				//build the scripts
				var paramScript = "<script type='text/javascript' data-cc-remarketing='params'>" 
					+ "var google_tag_params = "+JSON.stringify(gTagParams)+";"
					+	"</script>";
				var cdataScript = "<script type='text/javascript' data-cc-remarketing='cdata'>"
					+	"/* <![CDATA[ */"
					+	"var google_conversion_id = 1016752941;"
					+	"var google_custom_params = window.google_tag_params;"
					+	"var google_remarketing_only = true;"
					+	"/* ]]> */"
					+	"</script>";
				var conversionScript = "<script type='text/javascript' data-cc-remarketing='conversion'" 
					+	"src='//www.googleadservices.com/pagead/conversion.js'></script>";
				
				//run them scripts
				postscribe($("body"),paramScript);
				postscribe($("body"),cdataScript);
				postscribe($("body"),conversionScript);
			}, //addRemarketing
			
			suppress : function($context){
				var attempts = arguments[1] || 0;
				if(typeof _app.ext.store_cc.vars.suppressionList !== 'undefined'){
					$('a[href],area[href]',$context).each(function(){
						if($.inArray($(this).attr('href'), _app.ext.store_cc.vars.suppressionList) >= 0){
							var $suppress = $(this).closest('[data-suppress]');
							if($suppress.length){
								$suppress.empty().remove();
								}
							else {
								$(this).empty().remove();
								}
							}
						else {
							//leave it alone
							}
						});
					}
				else if(attempts < 50){
					setTimeout(function(){
						_app.ext.store_cc.u.suppress($context, attempts+1);
						}, 250);
					}
				else{
					//give up
					}
				},
			loadSuppressionList : function(callback){
				callback = callback || function(){};
				$.getJSON("suppression.json?_v="+(new Date()).getTime(), function(json){
					_app.ext.store_cc.vars.suppressionList = json;
					callback();
					})
				},
/* FILTER SEARCH UTILS */		
			//for top level category (ie: nhl-apparel) will check if data object has been loaded in vars and show content w/ it if it has,
			//if not, will get data from the JSON record and showContent w/ that. Shows 404 if data can't be found in vars or JSON record.
			getCatJSON : function(routeObj) {
				var route = routeObj.route;
//				dump('START getCatJSON'); dump(routeObj);
				var route = route.split('/')[0];
				
				if(_app.ext.store_cc.vars[route]) {
					dump('IT WAS ALREADY THERE...');
					var filterData = $.extend(true, {}, _app.ext.store_cc.vars[route]);
					filterData.breadcrumb = [filterData.id];
					showContent('static',{'templateid':routeObj.templateid,'id':data.id,'dataset':filterData});
				}
				else {
					$.getJSON("filters/apparel/"+route+".json?_v="+(new Date()).getTime(), function(json){
//						dump('THE CAT JSON IS...'); dump(json);
						var filterData = $.extend(true, {}, json);
						filterData.breadcrumb = [filterData.id];
						showContent('static',{'templateid':routeObj.templateid,'id':json.id,'dataset':filterData});
					})
					.fail(function() {
						dump('FILTER DATA FOR ' + route + 'COULD NOT BE LOADED.');
						showContent('404');
					});
				}
			},
			
			
/* CAROUSEL UTILS */
			//Turns shipping banners in header into an auto scrolling carousel. 
			runHeaderCarousel : function(destroy) {
//				_app.u.dump('----Running homepage carousels');	
				var destroy = destroy || false; //pass this argument to destroy the carousel 
				var $target = $("[data-ship-carousel]")
				//use a different element for higher than phone res (allows different format for content)
		//		if(screen.width > 750) { var $target = $("[data-ship-carousel='notmobile']"); }
		//		else { var $target = $("[data-ship-carousel='mobile']"); }
				//check if the carousel should be destroyed (if screen resize occured), restarted (if page is being revisited, although not likely for this particular carousel), 
				//or if it needs to be initialized again or for the first time. 
				if ($target.data('isCarousel') && destroy) { $target.data('isCarousel',false); $target.trigger('destroy'); /*dump('carouFredSel was destroyed');*/ } 
				else if($target.data('isCarousel'))	{$target.trigger('play'); /*dump('carouFredSel was played');*/ } //only make it a carousel once, but make sure it always scrolls
				else { 
					//dump('carouFredSel was initialized');
					$target.data('isCarousel',true);
					//for whatever reason, caroufredsel needs to be executed after a moment.
					setTimeout(function(){
						$target.carouFredSel({
							direction : "up",
							width:"100%",
							items	: {
								minimum: 1,
				//				width: "100%" //if a width is entered here fred decides it should be different. fred is a rebel.
							},
							scroll: {	fx: "fade" },
							auto: {
								delay : 1000,
								duration : 1500,
								timeoutDuration : 3000,
								easing : 'linear',
								pauseOnHover:"immediate"
							},
							swipe: { 
								onMouse: true,	
								onTouch: true 
							}
						});
					},2000); 
				} //HEADER shipping CAROUSEL
			},

			//Turns large banners on homepage into an auto scrolling carousel. 
			runHomeMainBanner : function($context, destroy) {
//				_app.u.dump('----Running homepage banner carousels');	
				var $target = $('.homeBanner ',$context);
				var destroy = destroy || false; //pass this argument to destroy the carousel 
				//check if the carousel should be destroyed (if screen resize occured), restarted (if page is being revisited, although not likely for this particular carousel), 
				//or if it needs to be initialized again or for the first time. 
				if ($target.data('isCarousel') && destroy) { $target.data('isCarousel',false); $target.trigger('destroy'); /*dump('carouFredSel was destroyed');*/ } 
				else if($target.data('isCarousel')) { $target.trigger('play'); /*dump('carouFredSel was played');*/ } //only make it a carousel once, but make sure it always scrolls
				else { 
//					dump('carouFredSel was initialized');
					var width = "680px";
					var carWidth = "100%";
					if(screen.width > 959) { width = "700px"; }
					if(screen.width < 768) { width = "300px";} 
					$target.data('isCarousel',true);
					//for whatever reason, caroufredsel needs to be executed after a moment.
					setTimeout(function(){
						$target.carouFredSel({
							width	: carWidth,
							items	: {
								width : width
							},
							scroll: {	fx: "cover-fade"	},
							auto:  {
								delay : 1000,
								duration : 1500,
								timeoutDuration : 4000,
								easing : 'linear',
								pauseOnHover:"immediate"
							},
							swipe: { 
								onMouse: true,	
								onTouch: true 
							},
							pagination: {
								container: ".mainPage",
								keys: true
							}
				/*			prev: {
								button: ".mainPrev",
								key: "left"
							},
							next: {
								button: ".mainNext",
								key: "right"
							}
				*/		});
					},2000); 
				} //HOMEPAGE main banner CAROUSEL
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
								delay : 1000,
								duration : 30000,
								timeoutDuration : 0,
								easing : 'linear',
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
			showHomepageBanners : function($context) {
			dump('START showHomepageBanners'); dump(_app.ext.store_cc.vars.homepageBanners.featured);
				var $container = $('.homeBanner', $context);
				var $featuredContainer = $('[data-home-featured="container"]', $context);
				if(!$container.hasClass('bannersRendered')) {
					if(_app.ext.store_cc.vars.homepageBanners && _app.ext.store_cc.vars.homepageBanners.main) {
						$container.addClass('bannersRendered');
						for(var i = 0; i < _app.ext.store_cc.vars.homepageBanners.main.length; i++) {
							var thisBanner = _app.ext.store_cc.vars.homepageBanners.main[i];
							var bannerWidth = thisBanner.width == "" ? 620 : thisBanner.width;
							var bannerHeight = thisBanner.height == "" ? 268 : thisBanner.height;
							//dump('BANNER WIDTH & HEIGHT'); dump(bannerWidth); dump(bannerHeight);
							var $wrapper = $("<div class='mainBanImageCont'></div>");
							$wrapper.append(_app.ext.store_cc.u.makeBanner(thisBanner,bannerWidth,bannerHeight,"ffffff"));
							$container.removeClass('loadingBG').append($wrapper);
						}
						_app.ext.store_cc.u.runHomeMainBanner($context);
					}
					else { setTimeout(this.showHomepageBanners,250); }
				}
				if(!$featuredContainer.hasClass('bannersRendered')) {
					if(_app.ext.store_cc.vars.homepageBanners && _app.ext.store_cc.vars.homepageBanners.featured) {
						$featuredContainer.addClass('bannersRendered');
						for(var j = 0; j < _app.ext.store_cc.vars.homepageBanners.featured.length; j++) {
							var nextBanner = _app.ext.store_cc.vars.homepageBanners.featured[j];
							var bannerWidth = nextBanner.width == "" ? 330 : nextBanner.width;
							var bannerHeight = nextBanner.height == "" ? 230 : nextBanner.height;
							var $destination = j == 0 ? $('[data-home-featured="first"]', $context) : $('[data-home-featured="second"]', $context);
							$destination.removeClass('loadingBG').append(_app.ext.store_cc.u.makeBanner(nextBanner,bannerWidth,bannerHeight,"ffffff"));
							if(nextBanner.label) {
								var  $label = $("<h2 class='title center'></h2>");
								$label.text(nextBanner.label);
								$('a',$destination).append($label);
							}
						}
					}
					else { setTimeout(this.showHomepageBanners,250); }
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
					return $img;
				}
			},
			
			showHeaderBanners : function($context) {
				dump('START buildHeaderBanners');
				
				var $headerContainer = $('[data-ship-carousel]', $context);
				if(!$headerContainer.hasClass('bannersRendered')) {
					//if phone res different messages used because of size, so different json
					if(_app.ext.store_cc.vars.homepageBanners) {
						var thisJSON = screen.width > 750 ? _app.ext.store_cc.vars.homepageBanners.header : _app.ext.store_cc.vars.homepageBanners.mobileheader; 
						//screen.width > 750 ? $headerContainer.parent().addClass('greenGradient') : $headerContainer.parent().addClass('greyGradient');
						dump(thisJSON);
						for(var i = 0; i < thisJSON.length; i++) {
							var thisBanner = thisJSON[i];
							var $parent = thisBanner.href ? $('<a href="'+thisBanner.href+'" class="shipCarItem"></a>') : $('<div class="shipCarItem"></div>');
							if(thisBanner.img) {
								var $img = $('<img src="images/'+thisBanner.img+'" class="shipLogo marginRight">');
								$parent.append($img);
							}
							if(thisBanner.boldlft) {
								var $boldLeft = $('<span class="bold promoCode">'+thisBanner.boldlft+'</span>');
								$parent.append($boldLeft);
							}
							if(thisBanner.msg) {
								var $msg = thisBanner.split ? $('<span class="marginRight promoCode">'+thisBanner.msg+'</span>') : $('<span>'+thisBanner.msg+'</span>');
								$parent.append($msg);
							}
							if(thisBanner.boldrt) {
								var $boldRight = $('<span class="bold promoOffer">'+thisBanner.boldrt+'</span>');
								$parent.append($boldRight);
							}
							$headerContainer.append($parent);
						}
					}
					else { setTimeout(this.showHeaderBanners,250); }
				}
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
			
/* COMPANY UTIL */			
			tempFAQ : function($og) {
				dump('START tempFAQ');
				var myFAQ = $(".tempFAQ",$og.parent());
				if(!myFAQ.data('myfaq-rendered')) {
					$og.hide();
					myFAQ.removeClass('displayNone').data('myfaq-rendered',true);
				}
				
			},
			
			//grabs the shipping container height, then hides it. User can click link to show it if they need to set HI or AK zip. Otherwise, zip should be set by ship rule. 
			getShipContainerHeight : function($context) {
				var $shipCont = $('.cartTemplateShippingContainer',$context);
				var h = $shipCont.innerHeight();
				$("[data-cc='regularship']",$context).attr("data-shipheight",h);
				$shipCont.css({"height":0,"overflow":"hidden"});
				$("[data-cc='zipclick']",$context).off("click").on("click",function() {
					$shipCont.animate({"height":h},500);
					$("[data-cc='hawaii']",$context).animate({"height":0,"opacity":0},500);
				});
			},
			
			//makes first letter of each word uppercase
			uppercaseFirst : function (phrase) {
				var newPhrase = ""
				phrase = phrase.split(" ");
				for(l = 0; l < phrase.length; l++) {
					if(l !== phrase.length - 1) {
						newPhrase += phrase[l].substring(0,1).toUpperCase() + phrase[l].substring(1,phrase[l].length) + " ";
					}
					else { newPhrase += phrase[l].substring(0,1).toUpperCase() + phrase[l].substring(1,phrase[l].length); }
				}
//				dump(newPhrase);
				return newPhrase;
			},
			
			//checks inventory of variations added on prod page and removes them if they are found to be less than 1
			showHideVariation : function($context, infoObj) {
				var data = _app.data['appProductGet|'+infoObj.pid];
				var variations = data['@variations'];
				if(variations.length == 1 /*&& variations[0].id.match(/A[BDEFGHM]/) */){
					var id = variations[0].id;
					//$('select[name='+id+'] option', $context).each(function(){
					$("[data-variationval]", $context).each(function(){
						var sku = infoObj.pid+":"+id+""+$(this).attr("data-pogval");
//						dump(sku); dump(data["@inventory"][sku]);
						if(data["@inventory"][sku] && data["@inventory"][sku].AVAILABLE <= 0){
							//$(this).attr("disabled","disabled");
							$(this).remove();
						}
					});
				}
			},
			
			//adds qty to cart item, but hides the field and adds a select list to use for changing the qty.
			//the input and the container the select list is added to must be children of the same container. 
			//also checks to see if the qty of the item added is more than available and sets to max available if so.
			cartitemqty : function($context)	{
//				dump('START cartitemqty');
				var thisCartDetail = _app.data['cartDetail|'+_app.model.fetchCartID()]['@ITEMS'];
				var products = []; var productsStid = [];
				for(var index in thisCartDetail){
					products.push(thisCartDetail[index].product);
					productsStid.push(thisCartDetail[index].stid);
				}
				
				var numRequests = 0;
				for(var index in products){
					var _tag = {
						"thisSTID" : productsStid[index],
						'callback':function(rd){
							if(_app.model.responseHasErrors(rd)){
								//If an item in your cart gets an error, you're gonna have a bad time...
								_app.u.throwMessage(rd);
								}
							else {
//							dump(rd.thisPID); dump(rd.thisSTID);
								var $thisCartItem = $("[data-stid='"+rd.thisSTID+"']",$context);
								var $tag = $("input[name='quantity']",$thisCartItem);
								var $parent = $tag.parent();
								var $select = $("<select class='qtySelect cartQtySelect' \/>");
								var $selectWrapper = $("[data-select-container]",$parent);
								var prod = _app.data[rd.datapointer]; //the complete product record from appProductGet
								var thisCartID = _app.model.fetchCartID();
								var cartItems = _app.data["cartDetail|"+thisCartID]["@ITEMS"];
								
								//get the record for the matching item in the cart.
								for(var k = 0; k < cartItems.length; k++) {
//									dump('cartItems[k].sku'); dump(cartItems[k].sku);
									if(cartItems[k].sku == rd.thisSTID) { var cartProd = cartItems[k]; } //the product record that is in the cart (needed for qty/asm/etc.)
								}
//								dump('cartitemqty cart items'); dump(cartProd);

								
								//check the max available qty of the item (w/ variation) for use later. 
//								dump(prod["@inventory"]); dump(prod["@variations"]);
								if(!$.isEmptyObject(prod["@inventory"]) && prod["@variations"].length && prod["@inventory"][rd.thisSTID]) {
//									dump("THERE IS inventory and variations"); 
									var max = prod["@inventory"][rd.thisSTID].AVAILABLE;
								}
								else if (!$.isEmptyObject(prod["@inventory"]) && !prod["@variations"].length) {
//									dump("THERE IS inventory but not variations"); 
									var max = prod["@inventory"][prod.pid].AVAILABLE;
								}
								else { 
									dump("Error in store_cc#cartitemqty. The variation is not available, or there is no inventory listed for the item "+prod.pid+"."); 
									max = false;
								}
								
								if(max !== false && !$.isEmptyObject(cartProd)) {
									// if they want more than available, let them know no es posible, and change qty to max available.
									if(Number(max) < Number(cartProd.qty)){
										dump('yes we have no bananas');
										$tag.val(max);
										var thisQty = max;
										
										//since the available was less than user requested qty, cart qty must be set to max and updated
										var vars = {"quantity":max,"stid":rd.thisSTID,"_cartid":thisCartID};
										_app.ext.cco.calls.cartItemUpdate.init(vars,{"max":max,"thisSKU":cartProd.sku,"thisCartID":thisCartID,"callback":function(rd2){
											if(_app.model.responseHasErrors(rd2)){
												$thisCartItem.anymessage({'message':rd2});
											}
											else {
												//qty succesfully changed, tell them it's different
												$thisCartItem.anymessage({"message":"There are only "+rd2.max+" of this item currently available. We appologize for any inconvinience, the quantity has been changed to "+rd2.max+"."});
												var order = _app.data["cartDetail|"+rd2.thisCartID]["@ITEMS"];
												for(var j = 0; j < order.length; j++) {
													if(order[j].sku == rd2.thisSKU) { order[j].qty = rd2.max; }
												}
								//				_app.ext.cco.calls.cartSet.init({"_cartid":rd2.thisCartID},{},'passive'); _app.model.dispatchThis('passive');
								//				setTimeout(function(){_app.ext.quickstart.u.handleMinicartUpdate({'datapointer':'cartDetail|'+rd2.thisCartID});},1000);
											}
										}});
									}
									//if the qty doesn't exceed the max, then we're cool
									else {								
										$tag.val(cartProd.qty);
										var thisQty = cartProd.qty;
									}
								
									//for coupons and assemblies, no input desired, but qty display is needed. so the qty is inserted where the input was.
									if((cartProd.stid && cartProd.stid[0] == '%') || cartProd.asm_master)	{
										$tag.prop('disabled',true).css('border-width','0')
										$("[data-cart-show='asm']",$parent).removeClass('displayNone');
										} 
									else	{
										$("[data-cart-show='select']",$parent).removeClass('displayNone');
										$tag.attr('data-stid',cartProd.stid);
										$tag.addClass('displayNone booty');
										
											//a select list for qty selection is desired, let's build it...
										for(var i = 1; i <= max; i++) {
											if(i == thisQty) { var $option = $("<option value="+i+" selected='selected'>"+[i]+"</option>"); }
											else { var $option = $("<option value="+i+">"+[i]+"</option>"); }
											$option.appendTo($select);
										}
										
										//leaving the default input field and changing that value to what is chosen in the select list is easier than rewriting 40 functions
										$select.change(function() {
											var selected = $(this).val();	//the option selected in select list
											$tag.val(selected).change();	//now the default input has the select value and can still be used for handleaddtocart.
										});
										$parent.css({"position":"relative","top":"-7px","margin":"5px 0"});
										$select.appendTo($selectWrapper);
										$selectWrapper.addClass('cartQtySelectWrapper');
									}
						//			_app.model.dispatchThis('immutable');
								}
							}
						}
					};
					numRequests += _app.ext.store_product.calls.appProductGet.init(products[index],_tag, 'immutable');
//					dump('numRequests'); dump(numRequests);
				}
				_app.model.dispatchThis('immutable');
			}, //cartitemqty
			
			//make sure any open dropdowns are closed when a link is clicked (or page changes) so that the view isn't obstructed by them.
			dismissAllDrop : function() {
//				dump('START dismissAllDrop');
				//if a dropdown is open, and the page changes, lets make sure the dropdowns are ready to open again later but close them before changing pages.
				$("[data-app-click='store_cc|dismissDrop']","#appView").each(function(){ $(this).attr("store_cc|expandDrop"); });
				$("[data-dropnav]","#appView").each(function(){ $(this).removeClass("expand"); });
				$("[data-drop-width='horiz']","#appView").each(function() { if(screen.width > 767) { $(this).css('height','0'); } }); //column-count needs a height
				$("[data-dropnav]","#appView").parent().each(function(){ $(this).removeClass("expandStyle"); });
			},
			
			//determines a height for the dropdown/dropout elements dynamically to play better w/ column-count (to allow alpha order by column)
			getHeight : function($item) {
//				dump('START getHeight');
				var height = 0;	//height of an element (all are the same size) for column height calculation
				var counter = 0;	//count of items to determine how many high a column needs to be
				var colWidth = $('[data-drop-width]',$item).attr("data-drop-width");	//"vert" for dropout menu, "horiz" for dropdown menu
//				dump('data-drop-width'); dump(colWidth); 
				$('a',$item).each(function(){	//get the count of anchors in the menu and the height each should be.
					dump($(this).outerHeight());
					if(counter == 1) { height += $(this).outerHeight(true); }
					counter += 1;
				});
			
				//determine how many columns to be used based on menu type and screen size (not used below tablet)
				if(colWidth == 'horiz') {
					if(screen.width < 960){ counter = counter/4 } //tablet dropdowns have 4 columns
					else { counter = counter/5  } //desktop dropdown have 5 columns 
				}
				else if(colWidth == 'vert') { 
					if(screen.width < 960) { counter = counter/3 } //tablet dropouts have 3 columns
					 else { counter = counter/4 } //desktop dropouts have 4 columns
				}
//				dump('the height: '+height+' and counter: '+counter);
				
				height = Math.ceil(counter) * height + 15; //round up and add a little padding to be sure there is enough room
				//$('.scrollDropout',$item).css('height',height+'px'); //this is set in where the function is called now. 
				return height;
			}
			
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
			showemailfriend : function($ele,p) {
				p.preventDefault();
				var $parent = $('#emailAFriendTemplate');
				var pid = $ele.parent().attr('data-pid');
				dump('--start showemailfriend'); dump(pid);
				$parent.dialog({
					'modal':'true', 'title':'Sizing Guide','width':'60%', 'max-height':300,'dialogClass':'emailDialog',
					'open' : function(event, ui) { 
						$("span",$parent).attr("data-pid",pid);
						$('.closeEmail','.emailDialog').on('click.closeModal', function(){$parent.dialog('close')});
						$('.ui-widget-overlay').on('click.closeModal', function(){$parent.dialog('close')});
					},
					'close': function(event, ui){ 
						$('.ui-widget-overlay').off('click.closeModal');
						$("span",$parent).attr("data-pid","");
					}
				});
				$(".ui-dialog-titlebar").hide();
			},
/*		
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
*/			
			emailfriend : function($form, p) {
				p.preventDefault();
				dump('-----start emailfriend...');
				var sender = $('input[name="youremail"]',$form).val();
				var recipient = $('input[name="theiremail"]',$form).val();
				var pid = $("span",$form).attr("data-pid");
				dump('emailfriend sender, & pid:'); dump(recipient);  dump(pid);
				var params = {
					'product' 	: pid,
					'recipient'	: recipient,
					'sender'		: sender,
					'method'	: 'tellafriend',
					'_cmd'		: 'appEmailSend',
					'_tag'		: {
						'callback':function(rd){
							if(_app.model.responseHasErrors(rd)) {
								$form.anymessage({'message':rd});
							}
							else {
								dump('emailfriend callback...'); dump(rd); 
								$form.anymessage(_app.u.successMsgObject("You've sent an e-mail to "+recipient+" successfully!"));
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
			
			//resets filter form: finds form button is contained in, unchecks all the checkboxes, submits the form.
			resetFilter : function($ele,p) {
				p.preventDefault();
//				dump('START resetFilter');
				var $form = $ele.closest('form');
				$('input[type=checkbox]',$form).each(function() {
					if($(this).prop('checked') === true) {
						$(this).prop('checked',false);
					}
				});
				dump('length:'); dump($('[data-reset-form]',$form).length);
				$('[data-reset-form]',$form).trigger('click');
			},
			
			//called on click of size variation. gets inventory available for the specific size and rebuilds the select list w/ that many options. 
			//Also populates ORDER SOON if option has less than 10 items (formerly getitwhileitlasts)
			buildThisQty : function($ele,p) {
				p.preventDefault();
				dump('START buildThisQty');
				var pid = $ele.closest("[data-templateid='productTemplate']").data("pid");
				var prod = _app.data["appProductGet|"+pid];
				var variationValue = $ele.data("variationval");
				var variation = pid + ":" + variationValue;
				var max = prod["@inventory"][variation].AVAILABLE; dump('available'); dump(max);
				var $form = $ele.closest("form");
				var $select = $("[data-select='qty']",$form);
				var $input = $("input[name=qty]",$form);
				
				//make the default option ('1' if there is available inventory, '-' if there are zero)
				if(max != 0) {	var $defaultOption = $("<option value='1' selected='selected'>1</option>"); }
				else { var $defaultOption = $("<option value='0' selected='selected'>-</option>"); }
				
				//clear the select to prevent ghosts, add the default option, then add additional options in inventory dictates.
				$select.empty().off("click");
				$defaultOption.appendTo($select);
				$select.attr("data-option-selected",variation);
				//if there is more than one avialable there will need to be more than the default option
				if(max > 1) {
					for(var i = 2; i <= max; i++) {
						var $option = $("<option value="+i+">"+[i]+"</option>");
						$option.appendTo($select);
					}
				}
				
				$select.change(function() {
					var selected = $(this).val();	//the option selected in select list
					$input.val(selected);				//now the default input has the select value and can still be used for handleaddtocart.
				});
				
				//show order soon if this option's available inventory is less than 10
				if(max < 10 && max != 0) {
					$(".addtocartbutton",$form).addClass("orderSoon").attr("type","submit").css({'opacity':1,'cursor':'pointer'});
					$(".leftInStock",$form).empty().text("Only "+max+" In Stock");
					$("[data-order-soon='1']",$form).show().animate({'height':'50px','margin':'0 0 15px 0'});		
					$(".ui-widget-anymessage",$form).hide();
				}
				//hide order soon if no inventory (shouldn't get here, but who knows)
				else if(max == 0) {
					//shouldn't be zero, but just in case:
					$("[data-order-soon='1']",$form).animate({'height':0,'margin':0});
					$(".addtocartbutton",$form).attr("type","disabled").css({'opacity':0.3,'cursor':'not-allowed'});
					$form.anymessage({"message":"We are sorry,<br> it appears as though this size has sold out!<br> Please select another."});
				}
				//hide order soon there is plenty of inventory available for this size
				else { 
					//"There were more than enough to go around, no need for alarm, but make sure the last size's order now option isn't showing still.
					$("[data-order-soon='1']",$form).animate({'height':0,'margin':0}).hide();
					$(".addtocartbutton",$form).attr("type","submit").css({'opacity':1,'cursor':'pointer'});
					$(".ui-widget-anymessage",$form).hide();
				}

				return false;
			},
			
			//toggles password field to indicate guest checkout (w/ no sign in) or user checkout (signed in) state to user. 
			//Is on a checkbox that is triggered w/ buttons above the actual template
			//most of this stolen from order_create|tagAsAccountCreate
			tagAsSignIn : function($ele,p)	{
				p.preventDefault();
				var $checkout = $ele.closest("[data-app-role='checkout']");
				_app.ext.cco.calls.cartSet.init({'_cartid':$checkout.data('cartid'),'want/sign_in': $ele.is(':checked') ? 1 : 0}); //val of a cb is on or off, but we want 1 or 0.
				_app.model.destroy('cartDetail|'+$checkout.data('cartid'));
				_app.ext.order_create.u.handlePanel($ele.closest('form'),'chkoutPreflight',['handleDisplayLogic']);
				_app.calls.cartDetail.init($checkout.data('cartid'));
				_app.model.dispatchThis('immutable');
				return false;
			}, //tagAsSignIn
			
			//if modal cart is opened in checkout, removes checkout and reloads it to be sure any changes made in the cart are reflected in checkout
			//if modal cart is not opened in checkout, goes to checkout.
			cartModalCheckout : function($ele, p) {
				p.preventDefault();
//				dump('START cartModalCheckout');
				//var goingTo = "/" + $ele.data("you-are-here");
				if($("#mainContentArea :visible:first").attr('data-app-uri') == "/checkout/") {
					$("#checkoutContainer").remove(); //kill the old checkout to be sure any changes made in the cart are updated. 
					_app.router.handleURIChange('/checkout/');
				}
				else {
					_app.router.handleURIChange('/checkout/');
				}
				
				return false;
			},
			
			//adds class to open header dropdown menus with css animation. Also sets closing action on the triggering element for next click.
			expandDrop : function($ele,p) {
//				dump('START expandDrop');
				//dismissDrop is in utils and runs on any template depart
				$ele.removeAttr('data-app-click');
				//if a dropdown is open, and another is clicked, lets make sure all are ready to open again later but close them before opening a new one.
				$("[data-app-click='store_cc|dismissDrop']","#appView").each(function(){ $(this).attr("data-app-click","store_cc|expandDrop"); });
				$("[data-dropnav]","#appView").each(function(){ $(this).removeClass("expand"); });
				$("[data-drop-width='horiz']","#appView").each(function() { if(screen.width > 767) { $(this).css('height','0'); } }); //column-count needs a height
				$("[data-dropnav]","#appView").parent().each(function(){ $(this).removeClass("expandStyle"); });
				$ele.attr('data-app-click','store_cc|dismissDrop'); //make sure this one is ready to close if clicked later.

				$("[data-dropnav]",$ele).addClass("expand"); //the class that does the magic
				if(screen.width > 767) { $("[data-drop-width]",$ele).css('height',_app.ext.store_cc.u.getHeight($ele)+'px'); } //column-count needs a height
				$("[data-dropnav]",$ele).parent().addClass("expandStyle"); //the class that does the magic
				$(".sprite",$ele).addClass("openMenu"); //turn arrow in mobile menu to show menu can be closed
				return false;
			},
			
			//adds class to close header dropdown menus with css animation Also sets open action on the triggering element for next click.
			//there is also a similar util function (dismissAllDrop) that gets run on template departure to ensure that the menus close if another link outside the menu is clicked.
			dismissDrop : function($ele,p) {
//				dump('START dismissDrop');
				$ele.removeAttr('data-app-click').attr('data-app-click','store_cc|expandDrop'); //make it ready to open again later
				$("[data-dropnav]",$ele).removeClass("expand"); //the class that does the magic
				if(screen.width > 767) { $("[data-drop-width='horiz']",$ele).css('height','0'); } //column-count needs a height
				$("[data-dropnav]",$ele).parent().removeClass("expandStyle"); //the class that does the magic
				$(".sprite",".slideMenuBorder").removeClass("openMenu"); //turn arrow in mobile menu to show menu can be opened
				return false;
			},
			
			//adds class to open mobile slideout menus with css animation. 
			//These are the same menus as header, but styled for mobile res, different class to animate different styles for different actions.
			expandMobilNav : function() {
				if(screen.width < 768) {  //this is only shown below tablet res so no need to run it at higher res.
			//		$(".mobileSlideMenu").animate({"left":"-5px"},500);
					$(".mobileSlideMenu").addClass("mobileExpand");
				}
			},
			
			//adds class to close mobile slideout menus with css animation (same notes for open action apply here).
			dismissMobilNav : function() {
				if(screen.width < 768) {  //this is only shown below tablet res so no need to run it at higher res.
			//		$(".mobileSlideMenu").animate({"left":"-275px"},500);
					$(".mobileSlideMenu").removeClass("mobileExpand");
				}
			},
			
			socialMediaClick : function($ele,p) { /*just here to send app event to google, everything needed is on the tag*/ },
			
			/* CREATE ACCOUNT UTILS */			
			handleAppLoginCreate : function($ele,p)	{
				p.preventDefault();
				if($ele)	{
					var formObj = $ele.serializeJSON();
			//TODO : email address check?
					if(formObj.pass !== formObj.pass2) {
						_app.u.throwMessage('Sorry, your passwords do not match! Please re-enter your password');
						return;
					}
					
					var tagObj = {
						'callback':function(rd) {
							if(_app.model.responseHasErrors(rd)) {
								$ele.anymessage({'message':rd});
							}
							else {
								//showContent('customer',{'show':'myaccount'});
								//_app.u.throwMessage(_app.u.successMsgObject("Your account has been created!"));
								$('html,body').animate({ scrollTop: 0 }, '500');
								setTimeout(function() {
										$("#loginMessaging").anymessage(_app.u.successMsgObject("Your account has been created!<br>Please Log In."));
								},550);
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
				return false;
			}, //handleAppLoginCreate
			
			//will call logBuyerOut, remove logged in class, and
			//show homepage if on my account page so my account isn't accessable any longer, 
			logBuyerOut : function($ele,p) {
				p.preventDefault();
				_app.u.logBuyerOut();
				if($("#mainContentArea :visible:first").attr("data-app-uri") === "/my_account/") {
					_app.router.handleURIChange("/");
				}
				$('body').removeClass('buyerLoggedIn'); 
				return false;
			}
			
			
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
							var prompt = (pog['@options'][j]['prompt']);
							
							dump(pogval);
							var $sizeOption = $("<div class='sizeOption pointer floatLeft' data-pogval='"+pogval+"' data-variationval='SZ"+pogval+"' data-app-click='store_cc|buildThisQty'></div>");
							$sizeOption.text(prompt);
							$sizeOption.click(function() {
								var $this = $(this);
								var thisSelection = $this.attr('data-pogval');
								$selectList.val(thisSelection);
								dump('You have clicked on '+$this.attr('data-pogval')+' good sir');
								$('.sizeOption',$sizeDiv).each(function() {
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
