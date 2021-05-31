/**
 * File excuting after page loaded
 * https://rocket-league.com/trades/YOURUSERNAME
 */

var tr_ids = []; //array with trade ids
var current_ids = []; //array ids of current trades
var loaded_ids = []; //array ids of loaded trades
var mode; //mode on/off
var username; //current username

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getOfferIds(){
	deleted_offers = [];
	new_offers = [];
	var trade_obj = $(".rlg-trade__bump");
	var name = $(".rlg-header-back").attr("href");
	var username = name.split("/"); //getting username from url
	/**
	 * Parsing current trade ids
	 */
	trade_obj.each(function(index) {
		var id = $(this).attr('data-alias');
		current_ids.push(id);
	});
	/**
	 * Checking loaded trade ids from storage and match with current
	 * if any from loaded doesn't exist then it marks like disabled
	 * and deleting from array
	 */
	for (let i = 0; i < loaded_ids.length; i++){
		if (loaded_ids[i] != ""){
			if((current_ids.includes(loaded_ids[i])) == false) {
				deleted_offers.push(loaded_ids[i]);
			}
		}
	}
	/**
	 * Checking current trade ids and match them with loaded list
	 * if found new from current it marks like new and adding to array
	 */
	for (let i = 0; i < current_ids.length; i++){	
			if (current_ids[i] != ""){
				if((loaded_ids.includes(current_ids[i])) == false) {
					new_offers.push(current_ids[i]);
				}
			}
	}
	/**
	 * Load data from storage
	 * and update it
	 */
	chrome.storage.sync.get("offerData",function(obj){
			var pluginArrayArg = new Array();
			//checking if key exist
			if (typeof obj.offerData != 'undefined')
			{
				var offdata = JSON.parse(obj.offerData);
				for (let i = 1; i <= offdata.length; i++){
					if (offdata[i-1].id != ""){
						//checking deleted trades and update storage data
						if (deleted_offers.includes(offdata[i-1].id) == false)
						{
								var jsonArg = new Object();
								jsonArg.id = offdata[i-1].id;
								jsonArg.comment = offdata[i-1].comment;
								jsonArg.status = offdata[i-1].status;
								jsonArg.name = offdata[i-1].name;
								jsonArg.mode = offdata[i-1].mode;
								pluginArrayArg.push(jsonArg);
						}
						else{
							if (offdata[i-1].status){
								tr_ids.push(offdata[i-1].id);
							}
						}
					}
				}
				//checking deleted trades and update storage data
				for(let j = 0; j < new_offers.length; j++){
					var jsonArg = new Object();
					jsonArg.id = new_offers[j];
					jsonArg.comment = "";
					jsonArg.status = 1;
					jsonArg.name = username[2];
					jsonArg.mode = 0;
					pluginArrayArg.push(jsonArg);
					tr_ids.push(new_offers[j]);
				}
			}
			//put new data into storage, if key doesn't exist put empty data
			var jsonArray = JSON.stringify(pluginArrayArg);
			chrome.storage.sync.set({"offerData": jsonArray},function(){
				console.log("[RLTradeBump] Loaded data, now you can use extenstion");
			});
		});
}

$(document).ready(function() {

const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Main function to bump trades
 */
const BumpIt = async () => {
	//checking if mode is on and array with trade ids more then 0
	if (mode && tr_ids.length > 0){
		try{
		  var bumped = 0;
		  for (let j = 0;j < tr_ids.length;j++)
		  {
			//Find button with certain id
			var btn_obj = $("[data-alias='"+tr_ids[j]+"']");
			btn_obj.click();
			//delay between click on the button "Bump" and server response to show popup window 
			await delay(2000);
			/**
			 * Check if popup with result is visible
			 */
			if($(".rlg-site-popup__container").is(":visible")){
				$(".rlg-site-popup__container").click();
				var msg = $(".rlg-site-popup__text").html();
				if (msg.indexOf("successfully") >= 0) {bumped++;} //count all bumped offers
				}
				else{
					/**
					 * if have some error with bumping 
					 * try bump after waiting 15 seconds
					 */
					await delay(15000);
					if($(".rlg-site-popup__container").is(":visible")){
					   $(".rlg-site-popup__container").click();
					   var msg = $(".rlg-site-popup__text").html();
					   if (msg.indexOf("successfully") >= 0) {bumped++;}
					}
					else{
						//if again error, skip it and continue bump next
						continue;
					}
				}
				//delay between bump each trade
				await delay(randomIntFromInterval(3000, 4000));
		  }
		  var today = new Date();
		  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		  console.log("["+time+"] Bumped "+bumped+"/"+tr_ids.length);
		  today.setMinutes(today.getMinutes() + 15);
		  console.log("Next bump: " + today.getHours()+":"+today.getMinutes()+":"+today.getSeconds());
		  //waiting 900000 ms = 15 minutes
		  await delay(900000);
		  //reloaded page to avoid session timeout
		  document.location.href = 'https://rocket-league.com/trades/'+username;
		}
		catch{
			/*if some errors with loading page
			waiting 60000 ms = 1 minute and reload page 
			*/
			await delay(60000);
			document.location.href = 'https://rocket-league.com/trades/'+username;
		}
	}
}
	/**
	 * Load data from storage
	 */
	try{
		chrome.storage.sync.get("offerData",function(obj){
			if (typeof obj.offerData != 'undefined')
			{
				var offdata = JSON.parse(obj.offerData);
				for (let i = 1; i <= offdata.length; i++){
					if (i == 1){
						mode = offdata[i-1].mode;
						username = offdata[i-1].name;
					}
					if (offdata[i-1].status){
						tr_ids.push(offdata[i-1].id);
					}
					loaded_ids.push(offdata[i-1].id);
				}
				getOfferIds();
				BumpIt();
			}
		});
	}
	catch(err){ console.log("error loading data")}

});


  

