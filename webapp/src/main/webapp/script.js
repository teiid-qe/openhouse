var map = null;
var currentPath = null;
var currentWiki = null;
var currentWiFi = null;

$(document).ready(function(){
    $.ajaxSetup({headers: {'Authorization':'Basic dXNlcjp1c2Vy', 'Accept':'application/json', 'Content-Type':'application/json'}});
    invokeOData('activity_names?$select=name', function(data){
        var elem = $("#pathSelectorDiv").empty();
        if(data.value.length === 0){
            elem.text("No paths to show")
        } else {
            for(i = 0; i < data.value.length; i++){
                var val = data.value[i].name;
                var id = "pathButton" + i;
                var option = $("<button></button>");
                option.text(val);
                option.addClass("path");
                option.addClass("actionable");
                option.addClass("inline");
                option.attr("id", id);
                option.attr("value", val);
                option.attr("onClick", "selectPath('" + id + "');");
                elem.append(option);
            }
        }
    });
});
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {zoom: 13, center: {lat: 49.2309837, lng: 16.5767087}});
}
function toggleWiki(){
    if(currentWiki === null){
        doForSelectedActivity(function(act){
            invokeOData("wiki?$filter=activity eq '" + act + "'", function(data){
                currentWiki = [];
                for(i = 0; i < data.value.length; i++){
                    var val = data.value[i];
                    currentWiki[i] = getMarker(val.lat, val.lng, "red", '<a target="_blank" href="' + val.url + '">Wikipedia URL</a>');
                }
                if(currentWiki.length > 0){
                    $("#wikiLogo").addClass("selected");
                } else {
                    currentWiki = null;
                    alert("No information from Wikipedia to display.");
                }
            });
        }, "Loading data from Wikipedia.");
    } else {
        clearWiki();
    }
}
function toggleWiFi(){
    if(currentWiFi === null){
        doForSelectedActivity(function(act){
            invokeOData("wifi?$filter=activity eq '" + act + "'", function(data){
                currentWiFi = [];
                for(i = 0; i < data.value.length; i++){
                    var val = data.value[i];
                    currentWiFi[i] = getMarker(val.lat, val.lng, "blue", "");
                }
                if(currentWiFi.length > 0){
                    $("#wifiLogo").addClass("selected");
                } else {
                    currentWiFi = null;
                    alert("No information about free Wi-Fi spots to display.");
                }
            });
        }, "Loading data of free Wi-Fi spots.");
    } else {
        clearWiFi();
    }
}
function getMarker(lat, lng, color, infoWindowMessage){
    var m = new google.maps.Marker({position:{lat: lat, lng: lng},
        map: map,
        icon: "http://maps.google.com/mapfiles/ms/icons/" + color + "-dot.png"});
    var win = new google.maps.InfoWindow({content: infoWindowMessage});
    m.addListener("click", function(){
        win.open(map, this);
    });
}
function exportToGoogle(){
    doForSelectedActivity(function(act){
        invokeODataAction("p", function(data){
            console.log(data);
        }, {name:"aaa"});
    }, "Exporting information to Google Sheet");

}
function selectPath(id){
    if(!$("#" + id).hasClass("selectedPath")){
        $(".selectedPath").removeClass("selected").removeClass("selectedPath");
        $("#" + id).addClass("selectedPath").addClass("selected")
        showPath();
    }
}
function showPath(){
    doForSelectedActivity(function(act){
        invokeOData("activities?$select=lat,lng&$filter=name eq '" + act + "'", function(data){
            if(currentPath !== null){
                currentPath.setMap(null);
                currentPath = null;
            }
            clearWiki();
            clearWiFi();
            currentPath = new google.maps.Polyline({
                path: data.value,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2});
            currentPath.setMap(map);
            map.setCenter(data.value[0]);
        });
    }, "Loading path.");
}
function doForSelectedActivity(action, message){
    var sp = $(".selectedPath").attr("value");
    if(sp !== undefined){
        showMessage(message, false);
        action(sp.split('_').join(' '));
        hideMessage(message);
    } else {
        var msg = "No activity selected.";
        showMessage(msg, true);
        setTimeout(function(){
            hideMessage(msg);
        }, 2000);
    }
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
}
function hideMessage(message){
    $("#" + getId(message)).remove();
    if($("#message").children().length === 0){
        $("#message").hide();
    }
}
function getId(message){
    return message.replace(/\.| |#/g, '_');
}
function clearWiki(){
    if(currentWiki !== null){
        for(i = 0; i < currentWiki.length; i++){
            currentWiki[i].setMap(null);
            currentWiki[i] = null;
        }
        currentWiki = null;
    }
    $("#wikiLogo").removeClass("selected");
}
function clearWiFi(){
    if(currentWiFi !== null){
        for(i = 0; i < currentWiFi.length; i++){
            currentWiFi[i].setMap(null);
            currentWiFi[i] = null;
        }
        currentWiFi = null;
    }
    $("#wifiLogo").removeClass("selected");
}
function invokeODataAction(url, callback, data){
    $.post('http://localhost:8080/odata4/test/openschool/' + url, JSON.stringify(data), callback);
}
function invokeOData(url, callback){
    $.get('http://localhost:8080/odata4/test/openschool/' + url, callback);
}
