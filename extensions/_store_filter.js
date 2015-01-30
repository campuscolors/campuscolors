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

var store_filter = function(_app) {
	var r = {


////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	vars : {
		templates : [
			"filteredSearchTemplate"
	//		"filteredSearchTemplateBrand"
			],
		filterLoadingComplete : false,
		filterPages : [],
		filterPageLoadQueue : [],
		elasticFields : {} // will get populated with data from appResource call
		},
	
	filterData : {}, //will get populated with data from filterPages, pushed from other extensions
	
	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
				_app.ext.store_filter.customFilters = {};
				_app.model.addDispatchToQ({"_cmd":"appResource","filename":"elastic_public.json","_tag":{"datapointer":"appResource|elastic_public", "callback":"handleElasticFields","extension":"store_filter"}},'mutable');
				_app.model.dispatchThis('mutable');
				
				//if there is any functionality required for this extension to load, put it here. such as a check for async google, the FB object, etc. return false if dependencies are not present. don't check for other extensions.
				r = true;

				return r;
				},
			onError : function()	{
//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
//you may or may not need it.
				_app.u.dump('BEGIN store_filter.callbacks.init.onError');
				}
			},
		handleElasticFields : {
			onSuccess : function(rd){
				var data = _app.data[rd.datapointer];
				for(var i in data.contents['@products']){
					var field = data.contents['@products'][i];
					_app.ext.store_filter.vars.elasticFields[field.id] = field;
					}
				},
			onError : function(){
				_app.u.dump('BEGIN store_filter.callbacks.handleElasticFields.onError');
				}
			}
		}, //callbacks



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//actions are functions triggered by a user interaction, such as a click/tap.
//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
		a : {

			}, //Actions

////////////////////////////////////   TLCFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

		tlcFormats : {
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
						//change : function(event, ui){_app.ext.store_filter.e.execFilteredSearch($(this), event);},
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
			filtercheckboxlist : function(data, thisTLC){
//				dump('START store_filter.filtercheckboxlist');
				var args = thisTLC.args2obj(data.command.args, data.globals);
				if(typeof args.filterType === "undefined"){
					args.filterType = 'checkboxList';
					}
				if(args.index){
					var list = data.globals.binds[data.globals.focusBind];
					var $tag = data.globals.tags[data.globals.focusTag];
					if(args.filterType){
						$tag.attr('data-filter-type',args.filterType);
						}
					$tag.attr('data-filter-index',args.index);
					for(var i in list){
						var o = list[i];
						var $t = $('<div data-filter="inputContainer"></div>');
						$t.append('<label class="hangingIndent"><input data-filter="filterCheckbox" type="checkbox" name="'+o.v+'" '+(o.checked ? 'checked="checked"' : '')+' />'+o.p+' <span data-filter="count"></span></label>');
						$('input', $t).on('change', function(event){
							_app.ext.store_filter.e.execFilteredSearch($(this).closest('form'), event);
						});
						if(o.hidden){$t.addClass('displayNone');}
						$tag.append($t);
						}
					return true;
					} 
				else {
					return false;
					}
				},
			}, //tlcFormats
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are exected by an event or action.
//any functions that are recycled should be here.
		u : {
			}, //u [utilities]

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
			execFilteredSearch : function($form, p){
		dump('$form.data'); dump($form.data);
				var loadFullList = $form.data('loadFullList'); dump('loadFullList: '); dump(loadFullList);
				// dump("Executing Filtered Search");
				if(loadFullList){
					_app.ext.store_filter.vars.filterLoadingComplete = false;
					}
				else {
					_app.ext.store_filter.vars.filterLoadingComplete = true;
					}
				//var $page = $form.data('jqContext'); //For form outside of page
				var $page = $form.closest('[data-filter=parent]');
				p.preventDefault();
				var $resultsContainer = $page.closest('[data-filter=parent]').find('[data-filter=resultsList]');
				dump($form.attr('data-filter-base'));
				var filterBase = JSON.parse($form.attr('data-filter-base'));
				var elasticsearch = {
					"filter" : {
						"and" : [filterBase]
					},
					"facets" : {}
					}
				$('[data-filter-type=sort]', $form).each(function(){
					var $selectedOption = $('option:selected',$(this));
					if($selectedOption.attr('data-filter-sort-attribute')){
						elasticsearch.sort = elasticsearch.sort || [];
						var sort = {};
						sort[$selectedOption.attr('data-filter-sort-attribute')] = {"order":$selectedOption.attr('data-filter-sort-direction')};
						elasticsearch.sort.push(sort);
						}
					});
				$('[data-filter-type=range]', $form).each(function(){
					var f = {"range" : {}};
					var vals = $(this).slider('values');
					var m =$(this).attr('data-filter-range-mult')
					if(m){
						vals = $.map(vals, function(e, i){ return e*m; });
						}
					f.range[$(this).attr('data-filter-index')] = {
						"gte" : vals[0],
						"lte" : vals[1]
						}
					elasticsearch.filter.and.push(f);
					});
				$('[data-filter-type=rangebox]', $form).each(function(){
					var vals = $(this).attr('data-values').split('|');
					var f = {"range" : {}};
					var m =$(this).attr('data-filter-range-mult')
					if(m){
						vals = $.map(vals, function(e, i){ return e*m; });
						}
					f.range[$(this).attr('data-filter-index')] = {
						"gte" : vals[0],
						"lte" : vals[1]
						}
					elasticsearch.filter.and.push(f);
					});
				$('[data-filter-type=checkboxList]', $form).each(function(){
					var filter = {"or" : []};
					$('[data-filter=count]', $(this)).empty();
					$('input[data-filter=filterCheckbox]', $(this)).each(function(){
						var index = $(this).closest('[data-filter-index]').attr('data-filter-index');
						if(!elasticsearch.facets[index]){
							//elasticsearch.facets[index] = {"terms" : {"field":index}}
							//elasticsearch.facets[index] = {"terms" : {"field":index,"all_terms":true}}
							elasticsearch.facets[index] = {"terms" : {"field":index,"size":2000}}
							}
						if($(this).is(":checked")){
							var f = {"term" : {}};
							f.term[index] = $(this).attr('name');
							filter.or.push(f);
							}
						});
					
					if(filter.or.length > 0){
						elasticsearch.filter.and.push(filter);
						}
					else {
						}
					});
				$('[data-filter-type=custom]', $form).each(function(){
					if($(this).is(':checked')){
						var id = $(this).attr('data-filter-custom');
						if(_app.ext.store_filter.customFilters[id]){
							dump(_app.ext.store_filter.customFilters[id]);
							elasticsearch.filter.and.push(_app.ext.store_filter.customFilters[id]);
							}
						else {
							dump('ERROR: in _app.ext.store_filter.e.execFilteredSearch, no custom filter found for id: '+id);
							}
						}
					});
				
				var es;
				if(!elasticsearch.sort){
					var tmp = {
						"query" :{
							"function_score" : {"filter":elasticsearch.filter}
/*							"function_score" : {
								"filter":elasticsearch.filter,
								"functions" : [
									{
										"field_value_factor" : {
											"field" : "boost"
											}
										}
									],
								"boost_mode" : "sum"
								}
*/							},
						"facets" : elasticsearch.facets
						}
					es = _app.ext.store_search.u.buildElasticRaw(tmp);
					}
				else {
					es = _app.ext.store_search.u.buildElasticRaw(elasticsearch);
					}
				
				//var es = _app.ext.store_search.u.buildElasticRaw(elasticsearch);
				if(loadFullList){
					es.size = 200;
					es.timeout = 60;
					}
				else {
					es.size = 30;
					}
				$resultsContainer.empty();
				
				_app.ext.store_search.u.updateDataOnListElement($resultsContainer,_app.u.getBlacklistedObject(es, ["facets"]),1);
				//dump(es);
				_app.model.dispatchThis();
				_app.ext.store_search.calls.appPublicSearch.init(es, {'callback':function(rd){
					if(_app.model.responseHasErrors(rd)){
						_app.u.throwMessage(rd);
						}
					else {
						_app.ext.prodlist_infinite.callbacks.handleInfiniteElasticResults.onSuccess(rd);
						if(_app.data[rd.datapointer].facets){
							$('[data-filter-type=checkboxList]',rd.filterList).each(function(){
								$('input', $(this)).each(function(){
									var index = $(this).closest('[data-filter-index]').attr('data-filter-index');
									var val = $(this).attr('name');
									
									var $fg = $(this).closest('.filterGroup')
									var $ic = $(this).closest('[data-filter=inputContainer]');
									
									var summary = $.grep(_app.data[rd.datapointer].facets[index].terms, function(e, i){
						//				return e.term === val;
										return e.term === val.toLowerCase(); 
										})[0];
									if(summary || $(this).prop('checked')){
										summary = summary || {count:0};
										$fg.show();
										$ic.show();
										$ic.addClass('show');
										$('[data-filter=count]', $ic).text("("+summary.count+")");
										}
									else {
										if($fg.hasClass('countHideImmune')){/*Don't hide it if it's immune*/}
										else{
											$ic.hide();
											$ic.removeClass('show');
											//$(this).prop('checked',false);
											if($('[data-filter=inputContainer].show',$fg).length < 1){
												$fg.hide();
												}
											}
										}
									});
								
								});
							}
						}
					}, 'datapointer':'appFilteredSearch','templateID':'productListTemplateResultsNoPreview','list':$resultsContainer, 'filterList' : $form, 'loadFullList' : loadFullList});
				_app.model.dispatchThis();
				
				}, //execFilteredSearch
				
				submitcheckbox : function($ele,p) {
					p.preventDefault();
					_app.ext.store_filter.e.execFilteredSearch($ele.closest('form'), p);
					return false;
				}
				
			}, //e [app Events]
		couplers : {
			pushFilterPage : function(args){
				dump('pushFilterPage');
				dump(args);
				if(args.id && args.jsonPath){
					_app.ext.store_filter.vars.filterPageLoadQueue[args.id] = args;
					}
				},
			pushCustomFilter  : function(args){
				if(args.id && args.filter){
					_app.ext.store_filter.customFilters[args.id] = args.filter;
					}
				else{
					dump('ERROR: _app.ext.store_filter.couplers.pushCustomFilter REQUIRES "id" AND "filter"');
					}
				}
			}
		} //r object.
	return r;
	}
