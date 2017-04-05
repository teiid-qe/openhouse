var map = null;
var currentWiki = null;
var currentWifi = null;
var currentFeatures = {"currentWifi": null, "currentWiki": null};
var lastEven = null;
var win = null;

$(document).ready(function(){
    $.ajaxSetup({
        headers: {'Authorization':'Basic dXNlcjp1c2Vy', 'Accept':'application/json', 'Content-Type':'application/json'},
        error: function(xhr, status, error) {
                displayError("An error occurred: " + status + " Error: " + error);
            }
    });
    invokeOData("Activity/activity_list?$select=name,id,created_at&$filter=type eq 'Run'&$top=10", function(data){
        var elem = $("#pathSelectorDiv").empty();
        if(data.value.length === 0){
            elem.text("No paths to show")
        } else {
            for(i = 0; i < data.value.length; i++){
                var val = data.value[i].name + " (" + data.value[i].created_at + ")";
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
    }, function(xhr, status, error){
        displayError("Cannot load paths.");
    });
});
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {zoom: 13, center: {lat: 49.2309837, lng: 16.5767087}});
    win = new google.maps.InfoWindow({pixelOffset: {width: 0, height: -30}});
    map.data.addListener('click', function(event) {
        var featureName = event.feature.getProperty('name');
        if(featureName){
            var url = event.feature.getProperty('url');
            var content = '<p class="featureName">' + featureName + '</p>';
            if(url){
                content += '<p><a href="' + url + '" target="_blank">Go to Wikipedia</a></p>';
            }
            win.setContent(content);
            win.setPosition({lat: event.latLng.lat(), lng: event.latLng.lng()});
            win.open(map);
        } else {
            win.close();
        }
    });
    map.data.setStyle(function(feature){
        if(feature.getProperty("url")){
            return {icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"};
        } else {
            return {icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"};
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
  if(currentFeatures[featureName] == null) {
      var act = getSelectedActivity();
      if(act === undefined){
          return;
      }
      var messageElem = showMessage("Loading " + featureDescription);
      invokeOData("Demo/" + featureTable + "(" + act + ")/RESPONSE", function(data){
            var parsedData = JSON.parse(data);
            currentFeatures[featureName] = map.data.addGeoJson(parsedData);
            $(featureButton).addClass("selected");
            hideMessage(messageElem);
      }, function(xhr, status, error){
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
function showPath(){
    var messageElem = showMessage("Loading path");
    var act = getSelectedActivity();
    invokeOData("Demo/activity_route(" + act + ")/RESPONSE", function(data){
        map.data.forEach(function(feat){
            map.data.remove(feat);
        });
        currentFeatures.currentWiki = null;
        currentFeatures.currentWifi = null;
        win.close();

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
    }, function(xhr, status, error){
        hideMessage(messageElem);
    });
}
function exportToGoogle() {
    var act = getSelectedActivity();
    if(act === undefined){
        return;
    }
    var messageElem = showMessage("Exporting information from Wikipedia to Google Sheet");
    invokeODataFunction("Demo/save_wiki_articles(activity_id=" + act + ")",
        function(data) {
            hideMessage(messageElem);
        }, function(xhr, status, error) {
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
function getSelectedActivity() {
    var sp = $(".selectedPath").attr("value");
    if(sp === undefined) {
        displayError("No activity selected.");
    }
    return sp;
}
function displayError(msg){
    var elem = showMessage(msg, true);
    setTimeout(function(){
        hideMessage(elem);
    }, 2000);
}
function showMessage(message, isErr){
    var id = message.replace(/\.| |#/g, '_');
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
function invokeODataFunction(url, success, fail){
    $.post('http://localhost:8080/odata4/demo/' + url, "", success)
        .fail(fail);
}
function invokeOData(url, success, fail){
    $.get('http://localhost:8080/odata4/demo/' + url, success)
        .fail(fail);
}
