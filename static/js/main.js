
// Initialize global variables
var phoneBrowsing = false;

var organzations;
var markers;

var addressLink;
var orderedWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var markerColoringDict = {
    'Open for Dropoff/Pickup': 'rgb(50,205,50)',
    'Open only for Dropoff': "rgb(44,123,182)",
    'Open only for Pickup': "rgb(171,217,233)",
    'Currently Closed': "rgb(215,25,28)",
    'Status Unknown': "rgb(110,110,110)"
}

var listingColoringDict = {
    'Open for Dropoff/Pickup': 'rgba(50,205,50,0.4)',
    'Open only for Dropoff': "rgba(44,123,182,0.4)",
    'Open only for Pickup': "rgba(171,217,233,0.4)",
    'Currently Closed': "rgba(215,25,28,0.4)",
    'Status Unknown': "rgba(110,110,110,0.4)"
}



// Determine if the user is browsing on mobile and adjust worldMapWidth if they are
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    phoneBrowsing = true;
}


function processFieldGroup(d, fieldNames) {
    var returnText = '';

    var fieldNames = fieldNames.filter(function(field) {
        return d[field];
    });

    fieldNames.forEach(function(field) {
        returnText += "<span style='color:black'><strong>" + field + "</strong>: " + d[field] + "</span></br>";
    })

    if (fieldNames.length > 0) {
        returnText += '<hr>';
    }

    return returnText;
}

function timeStringtoNum(timeString) {
    var hourVal = parseInt(timeString.slice(0, timeString.indexOf(':')));
    var minuteVal = parseInt(timeString.slice(timeString.length - 8, timeString.length - 6))

    var fractionalHour = hourVal + (minuteVal / 60)

    if (timeString.slice(timeString.length - 2) == 'PM') {
        fractionalHour += 12;
    }

    return fractionalHour;
}


function formatHours(weekdayString, startTime, endTime) {
    var weekdayAbbreviatons = {
        'Sunday': 'Sun',
        'Monday': 'Mon',
        'Tuesday': 'Tues',
        'Wednesday': 'Wed',
        'Thursday': 'Thurs',
        'Friday': 'Fri',
        'Saturday': 'Sat'
    }
    var firstDay = null;

    var formattedWeekdays = '';

    for (i=0; i < orderedWeekdays.length; i++) {
        if (weekdayString.includes(orderedWeekdays[i])) {

            if (i == 0 || i == orderedWeekdays.length - 1 ||  weekdayString.includes(orderedWeekdays[i-1]) == false || weekdayString.includes(orderedWeekdays[i+1]) == false) {
                formattedWeekdays += weekdayAbbreviatons[orderedWeekdays[i]];
            }

            if (i != orderedWeekdays.length - 1 && (weekdayString.includes(orderedWeekdays[i+1]) == false)) {
                formattedWeekdays += ', ';
            }
            else if (i != orderedWeekdays.length - 1 && (weekdayString.includes(orderedWeekdays[i+1]) == true) && formattedWeekdays[formattedWeekdays.length - 1] != '-') {
                formattedWeekdays += '-';
            }
        }
    }

    if (formattedWeekdays.slice(formattedWeekdays.length - 2) == ', ') {
        formattedWeekdays = formattedWeekdays.slice(0, formattedWeekdays.length - 2);
    }

    var formattedStart = startTime.slice(0, 3 + startTime.indexOf(':')) + ' ' + startTime.slice(startTime.length - 2);
    var formattedEnd = endTime.slice(0, 3 + endTime.indexOf(':')) + ' ' + endTime.slice(endTime.length - 2);

    return formattedWeekdays + ': ' + formattedStart + ' to ' + formattedEnd;
} 


function generatePopUpText(d) {

    var popupText = "<span style='color:black'><strong><h5>" + d.Organization + "</h5></strong></span>";
    popupText += "<span style='color:black'><strong>Neighborhood</strong>: " + d.Neighborhood + "</span></br>";
    popupText += "<span style='color:black'><strong>Address</strong>: <a href='" + addressLink + "' target='_blank'>" + d.Address + "</a></span></br>";
    // text += "<span style='color:black'><strong>Looking For</strong>: " + d["Looking for"] + "</span></br></br>";

    popupText += "<hr>"

    // Donation Info
    var donationFields = ['Donation Items', 'Urgent Need', 'Not Accepting'];
    popupText += processFieldGroup(d, donationFields);


    // Open Hours
    popupText += '<span style="color:black"><strong>Dropoff Hours</strong>: ';
    if (d['Dropoff Weekdays'] && d['Dropoff Start'] && d['Dropoff End']) {
        popupText += formatHours(d['Dropoff Weekdays'], d['Dropoff Start'], d['Dropoff End']);
    }
    else {
        popupText += 'N/A';
    }
    popupText += '</span><br>';

    popupText += '<span style="color:black"><strong>Pickup Hours</strong>: ';
    if (d['Pickup Weekdays'] && d['Pickup Start'] && d['Pickup End']) {
        popupText += formatHours(d['Pickup Weekdays'], d['Pickup Start'], d['Pickup End']);
    }
    else {
        popupText += 'N/A';
    }
    popupText += '</span>';
    popupText += '<hr>';


    // Contact Info
    var contactFields = ['Email', 'Venmo', 'CashApp', 'Paypal', 'Instagram', 'Phone Number'];
    popupText += processFieldGroup(d, contactFields);


    // Website Info
    var websiteFields = ['Website', 'Donation Link'];
    websiteFields.forEach(function(field) {
        if (d[field]) {
            popupText += "<span style='color:black'><strong><a href='" + d[field] + "' target='_blank'>" + field + "</a></strong>" + "</span></br>";
        }
    })

    // Notes
    if (d.Notes) {
        text += '<hr><span><strong>Notes</strong>: ' + d.Notes + '</span>';
    }

    return popupText

}

function determineOpenStatus(d, siteFunction) {
    var currentDateTime = new Date();
    var currentWeekday = orderedWeekdays[currentDateTime.getDay()];
    var dayWindow = false;
    var timeWindow = false;

    // If missing the needed fields to detemrine open status, just return unknown
    if ((!d['Location End Date'] && !d[(siteFunction + ' Weekdays')]) || (!d[(siteFunction + ' Start')] || !d[(siteFunction + ' End')])) {
        return 'Unknown';
    }

    // If this is a popup/temporary location, to be open we must be within the start/end dates
    if (d['Location Start Date'] && d['Location End Date']) {
        if (new Date(d['Location Start Date']) <= currentDateTime && new Date(d['Location End Date']) >= currentDateTime) {
            dayWindow = true;
        }
    }
    // Otherwise, the current weekday just needs to be part of the listed open weekdays
    else {
        if (d[(siteFunction + ' Weekdays')].includes(currentWeekday)) {
            dayWindow = true;
        }
    }

    // Determine whether the current time is within the open hour window
    var numericalStartTime = timeStringtoNum(d[(siteFunction + ' Start')]);
    var numericalEndTime = timeStringtoNum(d[(siteFunction + ' End')]);
    var currentTime = currentDateTime.getHours() + (currentDateTime.getMinutes() / 60)

    if (numericalStartTime <= currentTime && numericalEndTime >= currentTime) {
        timeWindow = true;
    }

    if (timeWindow && dayWindow) {
        return 'Open'
    }
    else {
        return 'Closed'
    }

}

function updateOrgs() {
    var displayData = organzations;

    Object.keys(markers._layers).forEach( function(layer) {
        markers.removeLayer(layer);
    });
    $(".site-listing")
        .remove();

    if ($('#search-val').val().length > 0) {
        // Get search query from box
        var searchTerm = $('#search-val').val().toLowerCase();

        // Filter to only groups whose names/neighborhoods contain the search term
        displayData = organzations.filter(function(d) {
            return ( d.Organization.toLowerCase().indexOf(searchTerm) !== -1 ||
                d.Neighborhood.toLowerCase().indexOf(searchTerm) !== -1)               
        });
    }

    displayData.sort(function(a,b) {
        if (a.Organization < b.Organization) {
            return -1;
        }
        if (a.Organization > b.Organization) {
            return 1;
        }
        return 0;
    })

    displayData.forEach(function(d, i) {
        // Determine Open Status
        var dropoffStatus = determineOpenStatus(d, 'Dropoff');
        var pickupStatus = determineOpenStatus(d, 'Pickup');

        var consolidatedStatus;
        if (dropoffStatus == 'Open' && pickupStatus == 'Open') {
            consolidatedStatus = 'Open for Dropoff/Pickup';
        }
        else if (dropoffStatus == 'Open') {
            consolidatedStatus = 'Open only for Dropoff';
        }
        else if (pickupStatus == 'Open') {
            consolidatedStatus = 'Open only for Pickup';
        }
        else if (dropoffStatus == 'Closed' || pickupStatus == 'Closed') {
            consolidatedStatus = 'Currently Closed';
        }
        else {
            consolidatedStatus = 'Status Unknown';
        }

        // Create and save a reference to each marker
        var marker = L.circleMarker([d.Latitude, d.Longitude], {'color': markerColoringDict[consolidatedStatus], 'radius': 5, 'weight': 1, 'fillOpacity': 0.7, myCustomId: i}).addTo(markers);
        markers.addLayer(marker);

        addressLink = "https://maps.google.com?saddr=Current+Location&daddr=" + encodeURI(d.Address);

        var popupText = '<div class="marker-text">';
        popupText += generatePopUpText(d);
        popupText += '</div>';
        marker.bindPopup(popupText);

        var listingText = '<div class="site-listing" style="background-color:' + listingColoringDict[consolidatedStatus] + ';" markerId="' + i + '"">'
        // background-color: rgba(220,220,220, 0.4);

        listingText += generatePopUpText(d);
        listingText += '</div>'

        $( "#location-list" ).append(listingText);
    })

    $(".site-listing")
        .on("click tap", function() {
            var markerId = $(this).attr('markerId');
            var matchingMarker = Object.values(markers._layers).find(function(d) {
                return d.options.myCustomId == markerId;
            });
            matchingMarker.fire('click');

    })

}

$("#search-val")
    .on("keyup", function() {
        updateOrgs();
    })


var promises = [
    d3.json("static/data/chicago.geojson"),
    d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vQSk1wJPE-qGziV-lDBCF1r8BluATrW1NBcqJNWgTkfXpefmS7Na-mBvf4oZZ1YDye0YgNQW9JhL9C0/pub?gid=0&single=true&output=csv")
    ];

Promise.all(promises).then(function(allData) {
    var neighborhoodGeoJSON = allData[0];
    organzations = allData[1];

    var mapCenter = d3.geoCentroid(allData[0]);

    var mymap = L.map('map-area').setView([mapCenter[1], mapCenter[0]], 11);
    mymap.options.minZoom = 10;

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoic2FtbGVhcm5lciIsImEiOiJja2IzNTFsZXMwaG44MzRsbWplbGNtNHo0In0.BmjC6OX6egwKdm0fAmN_Nw'
    }).addTo(mymap);

    L.geoJSON(neighborhoodGeoJSON, {weight: 1}).addTo(mymap);


    // setup a marker group
    markers = L.layerGroup().addTo(mymap);

    // Initialize markers/listings
    updateOrgs();


});



