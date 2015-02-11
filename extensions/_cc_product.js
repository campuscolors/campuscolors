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




var cc_product = function(_app) {
	var theseTemplates = new Array('');
	var r = {


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
				_app.u.dump('BEGIN admin_orders.callbacks.init.onError');
				}
			}
		}, //callbacks



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//actions are functions triggered by a user interaction, such as a click/tap.
//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
		a : { }, //Actions

////////////////////////////////////   TLCFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//tlcFormats are what is used to actually output data.
//on a data-tlc - format#extension, format: is equal to a tlcFormat. extension: tells the rendering engine where to look for the tlcFormat.
//that way, two tlc formats named the same (but in different extensions) don't overwrite each other.
		tlcFormats : { }, //tlcFormats
		
////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//renderFormats are what is used to actually output data.
//on a data-bind, format: is equal to a renderformat. extension: tells the rendering engine where to look for the renderFormat.
//that way, two render formats named the same (but in different extensions) don't overwrite each other.
		renderFormats : { }, //renderFormats
		
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are exected by an event or action.
//any functions that are recycled should be here.
		u : {	}, //u [utilities]

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
			
			//stolen from quickstart in order to manipulate the messaging
			//infoObj.listid and infoObj.sku are required.
			//optional params include: qty, priority, note, and replace. see API docs for explanation.
			add2BuyerList : function($ele,p){
	dump('START DKAFJDKL;ASFJKLD;SJFKLDSAJ');
				p.preventDefault();
				var pid = $ele.closest("[data-pid]").data('pid');
				if($ele.data('listid') && pid)	{
					infoObj = {'sku':pid,'listid':$ele.data('listid')};
					dump('START cc_product add2BuyerList'+infoObj.listid);
					
					
					var authState = _app.u.determineAuthentication();
					dump("authState: "+authState);
					if(typeof infoObj != 'object' || !infoObj.sku || !infoObj.listid)	{
						_app.u.throwMessage("Uh Oh! Something went wrong. Please try that again or contact the site administrator if error persists. err: required param for add2buyerList was missing. see console for details.");
						dump("ERROR! params missing for add2BuyerList. listid and pid required. params: "); dump(infoObj);
						}
					else if(authState && (authState == 'none' || authState == 'guest'))	{
						_app.ext.quickstart.u.showLoginModal();
						$('#loginSuccessContainer').empty(); //empty any existing login messaging (errors/warnings/etc)
	//this code is here instead of in showLoginModal (currently) because the 'showCustomer' code is bound to the 'close' on the modal.
						$('<button>').addClass('stdMargin ui-state-default ui-corner-all  ui-state-active ccButton').attr('id','modalLoginContinueButton').text('Add Item to List').click(function(){
							$('#loginFormForModal').dialog('close');
							_app.ext.quickstart.a.add2BuyerList(infoObj) //will re-execute function so after successful login, item is actually submitted to list.
							}).appendTo($('#loginSuccessContainer'));	
						}
					else	{
						var parentID = 'listUpdateMsgContainer';
						var $parent = $('#'+parentID)
						if($parent.length == 0)	{
							$parent = $("<div><div class='appMessaging'></div></div>").attr({'id':parentID,'title':'List Activity'}).appendTo('body');
							$parent.dialog({'autoOpen':false,"dialogClass":"wishyList"});
							}
						$parent.empty().dialog('open');
				//		var msg = _app.u.statusMsgObject('adding item '+infoObj.sku+' to list: '+infoObj.listid);
				//		msg.parentID = parentID;
				//		_app.u.throwMessage(msg);
						_app.model.destroy('buyerProductListDetail|'+infoObj.listid);
						_app.calls.buyerProductListAppendTo.init(infoObj,{'parentID':parentID,
						//this be a new callback to show just one success message prettylike.
						'callback':
							function(rd){ //'showMessaging','message':'Item '+infoObj.sku+' successfully added to list: '+infoObj.listid
								dump(rd);
								dump(infoObj.listid);
								var msg = _app.u.statusMsgObject('Item '+infoObj.sku+'<br>has been added<br>to your '+infoObj.listid);
								msg.parentID = rd.parentID;
								_app.u.throwMessage(msg);
								setTimeout(function() { $("button[title=close]",".wishyList").trigger("click") },6000);
							}
						},'immutable');
						_app.calls.buyerProductListDetail.init(infoObj.listid,{},'immutable')
						_app.model.dispatchThis('immutable');
						window[_app.vars.analyticsPointer]('send','event','Manage buyer list','User Event','item added '+infoObj.sku);
						}
				}
				else	{
					$('#globalMessaging').anymessage({"message":"In admin_crm.e.productAdd2List, unable to ascertain pid ["+pid+"] or data-listid was not set on trigger element.","gMessage":true});
				}
			}

		} //e [app Events]
	} //r object.
	return r;
}