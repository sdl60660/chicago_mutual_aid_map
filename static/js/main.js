
// Initialize global variables
var phoneBrowsing = false;
var addressLink


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


function formatHours(weekdayString, startTime, endTime) {
    var orderedWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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


var promises = [
    d3.json("static/data/chicago.geojson"),
    d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vQSk1wJPE-qGziV-lDBCF1r8BluATrW1NBcqJNWgTkfXpefmS7Na-mBvf4oZZ1YDye0YgNQW9JhL9C0/pub?gid=0&single=true&output=csv")
    ];

Promise.all(promises).then(function(allData) {
    var neighborhoodGeoJSON = allData[0];
    var organzations = allData[1];
    console.log(allData[1]);

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

    organzations.sort(function(a,b) {
        if (a.Organization < b.Organization) {
            return -1;
        }
        if (a.Organization > b.Organization) {
            return 1;
        }
        return 0;
    })


    markers = {};
    organzations.forEach(function(d, i) {
        // var marker = L.marker([d.Latitude, d.Longitude]).addTo(mymap);
        // var marker = L.circleMarker([d.Latitude, d.Longitude], {'color': 'green', 'radius': 5, 'weight': 1, 'fillOpacity': 0.7, myCustomId: ('marker-' + i)}).addTo(mymap);

        // Create and save a reference to each marker
        var marker = L.circleMarker([d.Latitude, d.Longitude], {'color': 'green', 'radius': 5, 'weight': 1, 'fillOpacity': 0.7, myCustomId: ('marker-' + i)}).addTo(mymap);


        // Add the ID
        // console.log(markers[i])
        // markers[i]._icon.id = i;

        addressLink = "https://maps.google.com?saddr=Current+Location&daddr=" + encodeURI(d.Address);

        var popupText = '<div class="marker-text">';
        popupText += generatePopUpText(d);
        popupText += '</div>';
        marker.bindPopup(popupText);

        var listingText = '<div class="site-listing">'
        listingText += generatePopUpText(d);
        listingText += '</div>'

        $( "#location-list" ).append(listingText);
    })
    



});



// function generateListingText(d) {
//     var listingText = '<div class="site-listing">'
//     listingText += "<div style='text-align:center;'><h5>" + d.Organization + "</h5></div>";
//     listingText += "<span style='color:black'><strong>Neighborhood</strong>: " + d.Neighborhood + "</span></br>";
//     listingText += "<span style='color:black'><strong>Address</strong>: <a href='" + addressLink + "' target='_blank'>" + d.Address + "</a></span></br></br>";

//     listingText += "<span style='color:black'><strong>Looking For</strong>: " + d["Looking for"] + "</span></br></br>";


//     listingText += "<span style='color:black'><strong>Email</strong>: " + d.Email + "</span></br>";
//     listingText += "<span style='color:black'><strong><a href='" + d["Donation Link"] + ">'>Donation Link</a></strong>" + "</span></br>";


//     listingText += "</div>";

//     return listingText;
// }


