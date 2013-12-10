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



var admin_sites = function() {
	
	var theseTemplates = new Array(
		"domainListTemplate",
		"domainListHostsRowTemplate"
		);
	
	var r = {


////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\



		callbacks : {
	//executed when extension is loaded. should include any validation that needs to occur.
			init : {
				onSuccess : function()	{
					var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
					app.model.fetchNLoadTemplates(app.vars.baseURL+'extensions/admin/sites.html',theseTemplates);
					app.rq.push(['css',0,app.vars.baseURL+'extensions/admin/sites.css','sites_styles']);
					//if there is any functionality required for this extension to load, put it here. such as a check for async google, the FB object, etc. return false if dependencies are not present. don't check for other extensions.
					r = true;

					return r;
					},
				onError : function()	{
	//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
	//you may or may not need it.
					app.u.dump('BEGIN admin_orders.callbacks.init.onError');
					}
				}
			}, //callbacks



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

		a : {
			
			showDomainConfig : function($target)	{
				$projects = $("<section>");
				app.ext.admin.i.DMICreate($projects,{
					'header' : 'Domain Configuration',
					'className' : 'domainConfig',
					'controls' : "",
					'buttons' : ["<button data-app-event='admin|refreshDMI'>Refresh List<\/button><button data-app-click='admin_sites|adminDomainCreateShow'><\/button>"],
					'thead' : ['Logo','Domain','Partition',''],
					'tbodyDatabind' : "var: projects(@DOMAINS); format:processList; loadsTemplate:domainManagerRowTemplate;",
					'cmdVars' : {
						'_cmd' : 'adminDomainList',
						'limit' : '50', //not supported for every call yet.
						'_tag' : {
							'datapointer':'adminDomainList'
							}
						}
					});
				$projects.appendTo($target);
				},
			
//The sites interface should always be opened in the sites tab.
			showSitesTab : function()	{
				var $target = $("#sitesContent");
				
				if(app.ext.admin.vars.tab != 'sites')	{
					app.ext.admin.u.bringTabIntoFocus('sites');
					app.ext.admin.u.bringTabContentIntoFocus($target);
					}
				
				$target.intervaledEmpty().anycontent({'templateID':'pageTemplateSites','showLoading':false}).anydelegate();

				app.ext.admin_sites.u.fetchSiteTabData('mutable');
				
				app.u.handleButtons($target);
				app.model.dispatchThis('mutable');

				}
			}, //Actions

////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//renderFormats are what is used to actually output data.
//on a data-bind, format: is equal to a renderformat. extension: tells the rendering engine where to look for the renderFormat.
//that way, two render formats named the same (but in different extensions) don't overwrite each other.
		renderFormats : {
				projectID2Pretty : function($tag,data)	{
					var o = data.value; //what will be Output into $tag. Defaults to project id (which is what should be in data.value
					if(app.data.adminProjectList && app.data.adminProjectList['@PROJECTS'])	{
						var index = app.ext.admin.u.getIndexInArrayByObjValue(app.data.adminProjectList['@PROJECTS'],'UUID',data.value);
						if(index === 0 || index >= 1)	{
							if(app.data.adminProjectList['@PROJECTS'][index].TITLE)	{
								o = app.data.adminProjectList['@PROJECTS'][index].TITLE;
								}
							}
						}
					$tag.text(o);
					},
				projectButtons : function($tag,data)	{
					var $menu = $("<menu \/>").addClass('projectMenu').hide();
					$tag.css('position','relative');  //so menu appears where it should.
					if(data.GITHUB_REPO)	{
						$menu.append("<li><a href='#' data-app-click='admin|linkOffSite' data-url='"+data.GITHUB_REPO+"'>Visit GitHub Repository<\/a><\/li>");
						}
					if(data.LINK)	{
						$menu.append("<li><a href='#' data-app-click='admin|linkOffSite' data-url='"+data.LINK+"'>Visit GitHub Repository<\/a><\/li>");
						}
					$menu.append("<li><a href='#' data-app-click='admin_sites|projectRemove'>Remove this Project<\/a><\/li>");

					$menu.menu();
					$tag.append($menu);
					$menu.css({'position':'absolute','width':200,'z-index':200,'top':25,'right':0});
					var $button = $("<button>").text("App Related Utilities").button({icons: {primary: "ui-icon-wrench",secondary: "ui-icon-triangle-1-s"},text: false});
					$button.on('click',function(){
						$menu.closest('table').find('menu.projectMenu').hide(); //close any open menus.
						$menu.show();
						$( document ).one( "click", function() {
							$menu.hide();
							});
						return false;
						})
					$tag.append($button);
					},
				//pass in HOSTTYPE as data.
				appHostButtons : function($tag,data)	{
					var $menu = $("<menu \/>").addClass('appHostMenu').hide();
					$tag.css('position','relative');  //so menu appears where it should.
					if(data.value == 'SITEPTR')	{
						$menu.append("<li><a href='#' data-app-event='admin_templateEditor|templateChooserShow' data-mode='Site'>Choose a Template</a></li>");
						$menu.append("<li><a href='#' data-app-event='admin_templateEditor|templateEditorShow' data-mode='Site'>Edit Project</a></li>");
						$menu.append("<li data-app-event='admin_templateEditor|containerFileUploadShow' data-mode='Site'><a href='#'>Upload Template Files</a></li>");
						}
					
					if(data.value == 'SITE' || data.value == 'SITEPTR' || data.value == 'APP')	{
						$menu.append("<li><a href='#' data-app-event='admin_batchJob|batchJobExec' data-whitelist='PROJECT' data-type='UTILITY/GITPULL'>Pull from GitHub</a></li>");
						$menu.append("<li><a href='#' data-app-event='admin_batchJob|batchJobExec' data-type='EXPORT/PAGES' >Export Pages.json</a></li>");
						$menu.append("<li><a href='#' data-app-event='admin_batchJob|batchJobExec' data-type='EXPORT/APPRESOURCE' >Export App Resource Zip</a></li>");
						}
					if($menu.children().length)	{
						$menu.menu();
						$tag.append($menu); //so menu appears where it should.
						$menu.css({'position':'absolute','width':200,'z-index':200,'top':25,'right':0});
						var $button = $("<button>").text("App Related Utilities").button({icons: {primary: "ui-icon-wrench",secondary: "ui-icon-triangle-1-s"},text: false});
						$button.on('click',function(){
							$menu.closest('table').find('menu.appHostMenu').hide(); //close any open menus.
							$menu.show();
							$( document ).one( "click", function() {
								$menu.hide();
								});
							return false;
							})
						$tag.append($button);
						}
					else	{
						//host/domain isn't app based.
						}
					}

			}, //renderFormats
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are exected by an event or action.
//any functions that are recycled should be here.
		u : {
			fetchSiteTabData : function(Q)	{
				app.model.addDispatchToQ({
					'_cmd':'adminDomainList',
					'hosts' : true,
					'_tag':	{
						'datapointer' : 'adminDomainList|hosts',
						'callback':'anycontent',
						'translateOnly' : true,
						'jqObj' : $("[data-app-role='domainsAndHostsContainer']:first",'#sitesContent')
						}
					},Q);
				app.model.addDispatchToQ({
					'_cmd':'adminProjectList',
					'_tag':	{
						'datapointer' : 'adminProjectList',
						'callback':'anycontent',
						'translateOnly' : true,
						'jqObj' : $("[data-app-role='projectsContainer']:first",'#sitesContent')
						}
					},Q);
				}
			}, //u [utilities]


		e : {

//if(domain == app.vars.domain)	{$ele.addClass('ui-state-highlight')}
			domainPutInFocus : function($ele,p)	{
				app.ext.admin.a.changeDomain(domain,$ele.closest("[data-prt]").attr('data-prt'));
				}, //domainPutInFocus

//				if($ele.closest("[data-is_favorite]").data('is_favorite') == 1)	{$ele.addClass('ui-state-highlight')}
			adminDomainToggleFavoriteExec : function($ele,p)	{
				$ele.toggleClass('ui-state-highlight');
				var domainname = $ele.closest("[data-domainname]").data('domainname');
				app.model.addDispatchToQ({
					'_tag':{
						'callback' : 'showMessaging',
						'message' : domainname+' has been '+($ele.hasClass('ui-state-highlight') ? 'tagged as a favorite. It will now show at the top of some domain lists.' : 'removed from your favorites')
						},
					'_cmd':'adminDomainMacro',
					'DOMAINNAME':domainname,
					'@updates':["DOMAIN-SET-FAVORITE?IS="+($ele.hasClass('ui-state-highlight') ? 1 : 0)]
					},'passive');
				app.model.dispatchThis('passive');
				}, //adminDomainToggleFavoriteExec

			adminDomainDetailShow : function($ele,p)	{
				var domainname = $ele.closest("[data-domainname]").data('domainname');
				
				if(domainname && ($ele.data('mode') == 'panel' || $ele.data('mode') == 'dialog'))	{
					var $panel;							
					if($ele.data('mode') == 'panel')	{
						$panel = app.ext.admin.i.DMIPanelOpen($ele,{
							'templateID' : 'domainUpdateTemplate',
							'panelID' : 'domain_'+domainname,
							'header' : 'Edit Domain: '+domainname,
							'handleAppEvents' : false
							});								
						}
					else	{
						$panel = app.ext.admin.i.dialogCreate({
							'title':'Edit Domain: '+domainname,
							'templateID':'domainUpdateTemplate',
							'showLoading':false //will get passed into anycontent and disable showLoading.
							});
						$panel.dialog('open');
						}

					$panel.attr({'data-domainname':domainname,'data-domain':domainname}); //### start using domainname instead of domain as much as possible. format in reponse changed.
					
					app.model.addDispatchToQ({'_cmd':'adminConfigDetail','prts':1,'_tag':{'datapointer':'adminConfigDetail|prts'}},'mutable');

					app.model.addDispatchToQ({
						'_cmd':'adminDomainDetail',
						'DOMAINNAME':domainname,
						'_tag':	{
							'datapointer' : 'adminDomainDetail|'+domainname,
							'extendByDatapointers' : ['adminConfigDetail|prts'],
							'callback':function(rd){
								if(app.model.responseHasErrors(rd)){
									$panel.anymessage({'message':rd});
									}
								else	{
									//success content goes here.
									rd.translateOnly = true;
									$panel.anycontent(rd);
									//in an each because passing in 'form',$panel selector 'joined' them so updating one form effected all the buttons..
									$('form',$panel).each(function(){
										app.ext.admin.u.applyEditTrackingToInputs($(this)); //applies 'edited' class when a field is updated. unlocks 'save' button.
										});
									app.ext.admin.u.handleFormConditionalDelegation($panel); //enables some form conditional logic 'presets' (ex: data-panel show/hide feature). applied to ALL forms in panel.
//									app.u.handleAppEvents($panel);
									app.u.handleCommonPlugins($panel);
									$("select[name='PRT']",$panel).val(app.data[rd.datapointer].PRT);
									}
								}
							}
						},'mutable');
					app.model.dispatchThis('mutable');
					}
				else	{
					$('#globalMessaging').anymessage({'message':'Unable to ascertain the domain OR data-mode not set.'})
					}
				}, //adminDomainDetailShow

			domainView : function($ele,p)	{
				var domainname = $ele.closest("[data-domainname]").data('domainname');
				if(domainname)	{
					if($ele.data('mode') == 'host')	{
						var hostname = $ele.closest("[data-hostname]").data('hostname');
						if(hostname)	{
							linkOffSite("http://"+hostname+"."+domainname+"/",'',true);
							}
						else {
							$('#globalMessaging').anymessage({"message":"In admin.e.domainView, unable to determine host.","gMessage":true});
							}
						}
					else	{
						linkOffSite("http://www."+domainname+"/",'',true);
						}
					}
				else	{
					$('#globalMessaging').anymessage({"message":"In admin.e.domainView, unable to determine domain.","gMessage":true});
					}
				},

			adminDomainCreateUpdateHostShow : function($btn)	{
				if($btn.data('mode') == 'create')	{
					$btn.button({icons: {primary: "ui-icon-circle-plus"},text: true});
					}
				else if($btn.data('mode') == 'update')	{
					$btn.button({icons: {primary: "ui-icon-pencil"},text: false});
					}
				else	{
					$btn.button();
					$btn.button('disable').attr('title','Invalid mode set on button');
					}

				$btn.off('click.adminDomainCreateUpdateHostShow').on('click.adminDomainCreateUpdateHostShow',function(event){
					event.preventDefault();
					var domain = $btn.closest('[data-domain]').data('domain');

					if(domain)	{
						var $D = app.ext.admin.i.dialogCreate({
							'title': $btn.data('mode') + '  host',
							'data' : (($btn.data('mode') == 'create') ? {'DOMAINNAME':domain} : $.extend({},app.data['adminDomainDetail|'+domain]['@HOSTS'][$btn.closest('tr').data('obj_index')],{'DOMAINNAME':domain})), //passes in DOMAINNAME and anything else that might be necessary for anycontent translation.
							'templateID':'domainAddUpdateHostTemplate',
							'showLoading':false //will get passed into anycontent and disable showLoading.
							});
//get the list of projects and populate the select list.  If the host has a project set, select it in the list.
						var _tag = {'datapointer' : 'adminProjectList','callback':function(rd){
							if(app.model.responseHasErrors(rd)){
								$("[data-panel-id='domainNewHostTypeSITEPTR']",$D).anymessage({'message':rd});
								}
							else	{
								//success content goes here.
								$("[data-panel-id='domainNewHostTypeSITEPTR']",$D).anycontent({'datapointer':rd.datapointer});
								if($btn.data('mode') == 'update')	{
//									app.u.dump(" -> $('input[name='PROJECT']',$D): "+$("input[name='PROJECT']",$D).length);
//									app.u.dump(" -> Should select this id: "+app.data['adminDomainDetail|'+domain]['@HOSTS'][$btn.closest('tr').data('obj_index')].PROJECT);
									$("input[name='PROJECT']",$D).val(app.data['adminDomainDetail|'+domain]['@HOSTS'][$btn.closest('tr').data('obj_index')].PROJECT)
									}
								}
						
							
							}};
						if(app.model.fetchData(_tag.datapointer) == false)	{
							app.model.addDispatchToQ({'_cmd':'adminProjectList','_tag':	_tag},'mutable'); //necessary for projects list in app based hosttypes.
							app.model.dispatchThis();
							}
						else	{
							app.u.handleCallback(_tag);
							}




						app.ext.admin.u.handleFormConditionalDelegation($('form',$D));
//hostname isn't editable once set.					
						if($btn.data('mode') == 'update')	{
							$("input[name='HOSTNAME']",$D).attr('disabled','disabled');
							}
						
						$("form",$D).append(
							$("<button>Save<\/button>").button().on('click',function(event){
								event.preventDefault();
								app.ext.admin_config.u.domainAddUpdateHost($btn.data('mode'),$('form',$D),$btn.closest('.ui-widget-anypanel'));
								})
							)
						
						$D.dialog('option','width',($('body').width() < 500) ? '100%' : '50%');
						$D.dialog('open');
						}
					else	{
						$btn.closest('.ui-widget-content').anymessage({'message':'In admin_config.e.adminDomainCreateUpdateHostShow, unable to ascertain domain.','gMessage':true});
						}
					});
				}, //adminDomainCreateUpdateHostShow
			
			projectDetailShow : function($ele,p)	{
				var $detailRow = $ele.closest('tr').next('tr');
				$detailRow.toggle();
				if($detailRow.is(':visible'))	{
					$detailRow.showLoading({'message':'Fetching project details'});
					var	projectUUID = $ele.closest("[data-uuid]").attr('data-uuid');
					if(projectUUID)	{
	//files are not currently fetched. slows things down and not really necessary since we link to github. set files=true in dispatch to get files.
						app.model.addDispatchToQ({
							"_cmd":"adminProjectDetail",
							"UUID":projectUUID,
							"_tag": {
								'callback':'anycontent',
								'translateOnly' : true,
								jqObj:$detailRow,
								'datapointer' : 'adminProjectDetail|'+projectUUID
								}
							},'mutable');
						app.model.dispatchThis('mutable'); 
						}
					else	{
						$('#globalMessaging').anymessage({"message":"In admin_sites.e.projectDetailShow, unable to ascertain project UUID.","gMessage":true});
						}
					
					}
				return false;
				}, //projectUpdateShow
			
			projectCreateShow : function($ele,p)	{
				var $D = app.ext.admin.i.dialogCreate({
					'title' : 'Create a New Project',
					'templateID' : 'projectCreateTemplate',
					showLoading : false
					});
				$D.dialog('open');
				$D.anydelegate();
				app.u.handleButtons($D);
				return false;
				}, //projectCreateShow
			
			projectCreateExec  : function($ele,p)	{
				var
					$form = $ele.closest('form'),
					sfo = $form.serializeJSON();
				
				if(app.u.validateForm($form))	{
					$form.showLoading({'message':'Adding your new project. This may take a few moments as the repository is imported.'});
					app.model.destroy('adminProjectList');
					sfo.UUID = app.u.guidGenerator();
					app.ext.admin.calls.adminProjectCreate.init(sfo,{'callback':function(rd){
						$form.hideLoading();
						if(app.model.responseHasErrors(rd)){
							$form.anymessage({'message':rd});
							}
						else	{
							$('#globalMessaging').anymessage(app.u.successMsgObject('Thank you, your project has been created.'));
							$ele.closest('.ui-dialog-content').dialog('close');
							navigateTo("#:sites");
							}
						}},'immutable');
					app.model.dispatchThis('immutable');
					}
				else	{} //validateForm handles error display.

				}, //projectCreateExec

			projectRemove : function($ele,p)	{
				var $D = app.ext.admin.i.dialogConfirmRemove({
					"message" : "Are you sure you wish to remove this app/project? There is no undo for this action.",
					"removeButtonText" : "Remove Project", //will default if blank
					"title" : "Remove Project", //will default if blank
					"removeFunction" : function(p,$D){
						$D.parent().showLoading({"message":"Deleting "});
						app.model.addDispatchToQ({
							'_cmd':'adminProjectRemove',
							'UUID' : $ele.closest("[data-uuid]").attr('data-uuid'),
							'_tag':	{
								'callback':function(rd){
									$D.parent().hideLoading();
									if(app.model.responseHasErrors(rd)){
										$D.anymessage({'message':rd});
										}
									else	{
										$D.dialog('close');
										$('#globalMessaging').anymessage(app.u.successMsgObject('Your project has been removed'));
										navigateTo("#:sites");
										}
									}
								}
							},'mutable');
						app.model.dispatchThis('mutable');
						}
					});
				return false;
				} //projectRemove
			

			} //e [app Events]
		} //r object.
	return r;
	}