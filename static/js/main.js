
// Initialize global variables
var phoneBrowsing = false;
var addressLink


// Determine if the user is browsing on mobile and adjust worldMapWidth if they are
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    phoneBrowsing = true;
}

// Organization
// Neighborhood
// Address


// Donation Items
// Urgent Need
// Not Accepting
// Notes
// Looking For
// Email
// Donation Link
// Venmo
// CashApp
// Paypal
// Instagram
// Website
// Phone Number



// (Unused so far in popup, use for coloring/add corresponding text once you have a sample submission)
// Dropoff Start
// Dropoff End
// Pickup Start
// Pickup End
// Open Weekdays
// Location Start Date
// Location End Date
// Direct Info?

function generatePopUpText(d) {
    var popupText = '<div class="marker-text">';
    popupText += "<span style='color:black'><strong><h5>" + d.Organization + "</h5></strong></span>";
    popupText += "<span style='color:black'><strong>Neighborhood</strong>: " + d.Neighborhood + "</span></br>";
    popupText += "<span style='color:black'><strong>Address</strong>: <a href='" + addressLink + "' target='_blank'>" + d.Address + "</a></span></br>";
    // text += "<span style='color:black'><strong>Looking For</strong>: " + d["Looking for"] + "</span></br></br>";

    popupText += "<hr>"

    var donationFieldsPresent = false;
    var donationFields = ['Donation Items', 'Urgent Need', 'Not Accepting'];
    donationFields.forEach(function(field, i) {
        if(d[field]) {
            donationFieldsPresent = true;
            popupText += "<span style='color:black'><strong>" + field + "</strong>: " + d[field] + "</span></br>";
        }
    })

    if (donationFieldsPresent) {
        popupText += '<hr>';
    }

    var optionalFields = ['Email', 'Venmo', 'CashApp', 'Paypal', 'Instagram', 'Phone Number'];
    optionalFields.forEach(function(field) {
        if (d[field]) {
            popupText += "</br><span style='color:black'><strong>" + field + "</strong>: " + d[field] + "</span>";
        }
    })
    

    var optionalLinkedFields = ['Website', 'Donation Link'];
    optionalLinkedFields.forEach(function(field) {
        if (d[field]) {
            popupText += "</br><span style='color:black'><strong><a href='" + d[field] + "' target='_blank'>" + field + "</a></strong>" + "</span>";
        }
    })
    // popupText += "<span style='color:black'><strong><a href='" + d["Donation Link"] + ">'>Donation Link</a></strong>" + "</span></br>";
    if (d.Notes) {
        text += '<hr><span><strong>Notes</strong>: ' + d.Notes + '</span>';
    }

    popupText += '</div>';

    return popupText
}

function generateListingText(d) {
    var listingText = '<div class="site-listing">'
    listingText += "<div style='text-align:center;'><h5>" + d.Organization + "</h5></div>";
    listingText += "<span style='color:black'><strong>Neighborhood</strong>: " + d.Neighborhood + "</span></br>";
    listingText += "<span style='color:black'><strong>Address</strong>: <a href='" + addressLink + "' target='_blank'>" + d.Address + "</a></span></br></br>";

    listingText += "<span style='color:black'><strong>Looking For</strong>: " + d["Looking for"] + "</span></br></br>";


    listingText += "<span style='color:black'><strong>Email</strong>: " + d.Email + "</span></br>";
    listingText += "<span style='color:black'><strong><a href='" + d["Donation Link"] + ">'>Donation Link</a></strong>" + "</span></br>";


    listingText += "</div>";

    return listingText;
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

        var popupText = generatePopUpText(d);
        marker.bindPopup(popupText);

        var listingText = generateListingText(d);

        $( "#location-list" ).append(listingText);
    })
    



});


