
// Initialize global variables
var phoneBrowsing = false;
var tipVisible = false;


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

    var width = 600
    var height = 800

    var projection = d3.geoMercator()
        .scale(width * 40)
        .center([-87.6298, 41.8781])
        .translate([width / 2, height / 2])
        .fitSize([width, height], neighborhoodGeoJSON )

    
    var svg = d3.select("#map-area")
        .append("svg")

    svg
        .attr("width", width)
        .attr("height", height)
        .attr("preserveAspectRatio", "xMinYMin meet")

    var g = svg
        .append('g')
            .attr('class', 'map');

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d) {
            var text = "<span style='color:white'><strong>Organization</strong>: " + d.Organization + "</span></br></br>";
            text += "<span style='color:white'><strong>Address</strong>: " + d.Address + "</span></br>";
            text += "<span style='color:white'><strong>Looking For</strong>: " + d["Looking for"] + "</span></br></br>";

            text += "<span style='color:white'><strong>Email</strong>: " + d.Email + "</span></br>";
            text += "<span style='color:white'><strong>Donation Link</strong>: " + d["Donation Link"] + "</span></br>";
            // text += "<span style='color:white'><strong>Address</strong>: " + d.Address + "</span></br>";
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
                // console.log(d);
                return "blue";
            })

            // .on('mouseover',function(d){
            //     vis.tip.show(d);

            //     var hoverStrokeWidth = vis.currentZoom > 4 ? 1.5 : 3;

            //     d3.selectAll('.' + this.getAttribute('class'))
            //         .style("opacity", 1)
            //         .style("stroke","black")
            //         .style("stroke-width", hoverStrokeWidth);
            // })
            // .on('mouseout', function(d){
            //     vis.tip.hide(d);

            //     d3.selectAll('.' + this.getAttribute('class'))
            //         .style("opacity", 0.8)
            //         .style("stroke","black")
            //         .style("stroke-width", function(e, i, n) {
            //             return n[i].getAttribute('default-stroke')
            //         });
            // })
            // .on('click', function(d) {
            //     infoBoxActive = true;

            //     infoBoxSelection = d;
            //     infoBoxMapUnit = vis.mapUnit;

            //     updateInfoText();
            // })
            // .style("fill", function(d) {
            //     if(typeof vis.nbaYearData[d.properties.name] != "undefined") {
            //         return vis.color(vis.nbaYearData[d.properties.name][currentProperty]/populationData[vis.mapUnit][displayYear-1][d.properties.name]);
            //     }
            //     else {
            //         return "white";
            //     }    
            // });

    var orgPoints = g.selectAll("circle")
        .data(organzations)
        .enter()
        .append("circle")
            .attr("cx", function(d) {
                console.log(projection([d.Longitude, d.Latitude])[0]);
                return projection([d.Longitude, d.Latitude])[0]
            })
            .attr("cy", function(d) {
                return projection([d.Longitude, d.Latitude])[1]
            })
            .attr("r", 4)
            .attr("opacity", 0.8)
            .style("fill", "red")
            .on('click tap',function(d){
                tip.show(d);
                tipVisible = true;
            })
            // .on('mouseout', function(d){
            //     tip.hide(d);
            // })




    var zoom = d3.zoom()
        .scaleExtent([1, 15])
        .on('zoom', function() {
            svg.selectAll('path')
                .attr('transform', d3.event.transform);
            svg.selectAll('.d3-tip')
                .attr('transform', d3.event.transform);
            svg.selectAll('circle')
                .attr('transform', d3.event.transform)
                .attr('r', function() {
                    if (d3.event.transform.k > 6) {
                        return 2
                    }
                    else {
                        return 4;
                    }
                });
        });

    svg.call(zoom);



});


