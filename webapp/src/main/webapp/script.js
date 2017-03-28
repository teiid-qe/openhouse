var map = null;
var currentWiki = null;
var currentWifi = null;
var currentFeatures = {"currentWifi": null, "currentWiki": null};
var lastEven = null;

$(document).ready(function(){
    $.ajaxSetup({headers: {'Authorization':'Basic dGVpaWRVc2VyOmR2ZHZkdjAh', 'Accept':'application/json', 'Content-Type':'application/json'}});
    invokeOData('Activity/activity_list?$select=name,id', function(data){
        var elem = $("#pathSelectorDiv").empty();
        if(data.value.length === 0){
            elem.text("No paths to show")
        } else {
            for(i = 0; i < data.value.length; i++){
                var val = data.value[i].name;
                var activityId = data.value[i].id;
                var id = "pathButton" + i;
                var option = $("<button></button>");
                option.text(val);
                option.addClass("path");
                option.addClass("actionable");
                option.addClass("inline");
                option.attr("id", id);
                option.attr("value", activityId);
                option.attr("onClick", "selectPath('" + id + "');");
                elem.append(option);
            }
        }
    });
});

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {zoom: 13, center: {lat: 49.2309837, lng: 16.5767087}});
    var win = new google.maps.InfoWindow({pixelOffset: {width: 0, height: -30}});
    map.data.addListener('click', function(event) {
	  var featureName = event.feature.getProperty('name');
	  if(featureName){
		  win.setContent(featureName);
		  win.setPosition({lat: event.latLng.lat(), lng: event.latLng.lng()});
		  win.open(map);
	  } else {
		  win.close();	
	  }
	});
}

function toggleWiki(featureButton){
	loadAndToggleFeatures("currentWiki", "wikis_around_route", "Wiki articles", featureButton);
}

function toggleWiFi(featureButton){
	loadAndToggleFeatures("currentWifi", "wifi_spots_around_route", "WiFi Points", featureButton);
}


function loadAndToggleFeatures(featureName, featureTable, featureDescription, featureButton){
	console.log(featureButton);
	if(currentFeatures[featureName] == null) {
		var messageElem = showMessage("Loading " + featureDescription);
		var act = getSelectedActivity();
	    invokeOData("Demo/" + featureTable + "(" + act + ")/RESPONSE", function(data){
	        var parsedData = JSON.parse(data);
	        currentFeatures[featureName] = map.data.addGeoJson(parsedData);
	        $(featureButton).addClass("selected");
	        hideMessage(messageElem);
	    });
	} else {
		var featureShown = toggleFeatures(currentFeatures[featureName]);
		$(featureButton).toggleClass("selected", featureShown);
	}
}

function toggleFeatures(featureList) {
	if(featureList.length > 0){
		if(map.data.contains(featureList[0])){
			featureList.forEach(function(feature){
				map.data.remove(feature);
			});
			return false;
		} else {
			featureList.forEach(function(feature){
				map.data.add(feature);
			});
			return true;
		}
	}
	return false;
}

function exportToGoogle() {
	var messageElem = showMessage("Exporting information to Google Sheet");
	invokeODataAction("Demo/save_wiki_articles(activity_id=" + getSelectedActivity() + ")", function(data) {
	        hideMessage(messageElem);
		});

}
function selectPath(id){
    if(!$("#" + id).hasClass("selectedPath")){
        $(".selectedPath").removeClass("selected").removeClass("selectedPath");
        $("#" + id).addClass("selectedPath").addClass("selected")
        showPath();
    }
}

function showPath(){
	var messageElem = showMessage("Loading path");
	var act = getSelectedActivity();
    invokeOData("Demo/activity_route(" + act + ")/RESPONSE", function(data){
    	
        map.data.forEach(function(feat){
        	map.data.remove(feat);
        });
        currentFeatures.currentWiki = null;
        currentFeatures.currentWifi = null;
        
        $("#wikiLogo").removeClass("selected");
        $("#wifiLogo").removeClass("selected");
        
        var parsedData = JSON.parse(data);
        
        var bounds = new google.maps.LatLngBounds();
        for(i = 0; i < parsedData.geometry.coordinates.length; i++){
        	var point = parsedData.geometry.coordinates[i];
        	bounds.extend({"lng": point[0], "lat": point[1]});
        }
        map.setCenter(bounds.getCenter());
        map.fitBounds(bounds);
        
        map.data.addGeoJson(parsedData);
        hideMessage(messageElem);
    });
}

function getSelectedActivity() {
    var sp = $(".selectedPath").attr("value");
    if(sp === undefined) {
        var msg = "No activity selected.";
        showMessage(msg, true);
        setTimeout(function(){
            hideMessage(msg);
        }, 2000);
    }
    return sp;
}
function showMessage(message, isErr){
    var id = getId(message);
    if($("#" + id).length !== 0){
        return;
    }
    var p = $("<p></p>");
    p.attr("id", id);
    p.addClass("partMessage");
    p.addClass(isErr ? "errorMessage" : "infoMessage");
    p.text(message);
    var m = $("#message");
    if(m.children().length === 0){
        m.show();
    }
    m.append(p);
    return p;
}
function hideMessage(messageElem){
	messageElem.remove();
    if($("#message").children().length === 0){
        $("#message").hide();
    }
}
function getId(message){
    return message.replace(/\.| |#/g, '_');
}
function clearWiki(){
    $("#wikiLogo").removeClass("selected");
}
function clearWiFi(){
}
function invokeODataAction(url, callback){
    $.post('http://localhost:8080/odata4/demo/' + url, "", callback);
}
function invokeOData(url, callback){
    $.get('http://localhost:8080/odata4/demo/' + url, callback);
}
