
// Initialize global variables
var phoneBrowsing = false;
var tipVisible = false;
var tooltipTarget;
var tooltipFeature;


// Determine if the user is browsing on mobile and adjust worldMapWidth if they are
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    phoneBrowsing = true;
}



function step() {
    // console.log(displayYear);
    // displayYear = displayYear == 2020 ? startYear : displayYear + 1;
    // $("#yearLabel").text((displayYear - 1) + '-' + (displayYear));
    // $("#slider-div").slider("value", displayYear);

    updateCharts();
}


function updateCharts() {

}

function initTooltip() {
    var tip = d3.tip().attr('class', 'd3-tip')
        .html(function(d) {
            var text = "<span style='color:white'><strong>Organization</strong>: " + d.Organization + "</span></br></br>";
            text += "<span style='color:white'><strong>Address</strong>: " + d.Address + "</span></br>";
            text += "<span style='color:white'><strong>Notes</strong>: " + d.Notes + "</span></br>";
            // text += "<span style='color:white'><strong>Address</strong>: " + d.Address + "</span></br>";
            return text;
    })
    g.call(tip);
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

    var margin = {top: 30, right: 20, bottom: 30, left: 20};
    var width = 600 - margin.left - margin.right;
    var height = 750 - margin.top - margin.bottom;

    var svg = d3.select("#map-area")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("preserveAspectRatio", "xMinYMin meet");


    var g = svg.append("g")
        .attr("class", "map")
        .attr("id", "city-map")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");


    var projection = d3.geoMercator()
        .scale(width * 40)
        .center(mapCenter)
        .translate([width / 2, height / 2])
        .fitSize([width, height], neighborhoodGeoJSON )


    // svg
    //     .attr("transform", "translate(50, 100)")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("preserveAspectRatio", "xMinYMin meet")

    // var g = svg
    //     .append('g')
    //         .attr('class', 'map');

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d) {
            var text = "<span style='color:white'><strong>Organization</strong>: " + d.Organization + "</span></br></br>";
            text += "<span style='color:white'><strong>Neighborhood</strong>: " + d.Neighborhood + "</span></br>";
            text += "<span style='color:white'><strong>Address</strong>: " + d.Address + "</span></br>";
            text += "<span style='color:white'><strong>Looking For</strong>: " + d["Looking for"] + "</span></br></br>";

            text += "<span style='color:white'><strong>Email</strong>: " + d.Email + "</span></br>";
            text += "<span style='color:white'><strong><a href='" + d["Donation Link"] + ">'>Donation Link</a></strong>" + "</span></br>";

            return text;
    })
    g.call(tip);

    // g.on("click tap", function() {
    //     if (tipVisible == true) {
    //         tip.hide();
    //         tipVisible = false;
    //     }
    // })

    var path = d3.geoPath()
        .projection(projection)

    var mapPath = g.append("g")
        .attr("class", "city-map")
        .selectAll("path")
        .data( neighborhoodGeoJSON.features );

    mapPath
        .enter()
        .append("path")
            .attr("d", path)
            .attr("class", "neighborhood")
            // .attr("default-stroke", 0.3)
            .style("fill-opacity", 0.4)
            .style("stroke","black")
            .style('stroke-width', 0.3)
            .style("fill", function(d) {
                return "blue";
            })


    var orgPoints = g.selectAll("circle")
        .data(organzations)
        .enter()
        .append("circle")
            .attr("cx", function(d) {
                return projection([d.Longitude, d.Latitude])[0]
            })
            .attr("cy", function(d) {
                return projection([d.Longitude, d.Latitude])[1]
            })
            .attr("r", 3.5)
            .attr("opacity", 0.8)
            .style("fill", "red")
            .attr("stroke-width", 0.5)
            .attr("stroke", "black")
            .on('click tap',function(d, i, n){
                // var target = d3.select(n[i]);
                tooltipFeature = d;
                tooltipTarget = n[i];
                tip.hide();
                tip.show(d, tooltipTarget);
                tipVisible = true;
            })


    var zoom = d3.zoom()
        .scaleExtent([1, 13])
        .translateExtent([[-100, -100], [width+100, height+100]])
        .on('zoom', function() {
            // tip.hide();
            tip.show(tooltipFeature, tooltipTarget);

            svg.selectAll('path')
                .attr('transform', d3.event.transform);
            d3.selectAll('.d3-tip')
                .attr('transform', 'translate(' + d3.event.transform.x + ',' + d3.event.transform.y);
            svg.selectAll('circle')
                .attr('transform', d3.event.transform)
                .attr('r', function() {
                    if (d3.event.transform.k > 6) {
                        return 2
                    }
                    else {
                        return 3.5;
                    }
                });
        });

    svg.call(zoom);



});


