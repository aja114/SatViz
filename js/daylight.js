var π = Math.PI;
var radians = π / 180;
var degrees = 180 / π;
var circle = d3.geoCircle().radius(90);
var nownow = moment(Date.now());

var addDaylight = function() {
  svg = d3.select("g#map")

  var dl = svg.append("g")
              .attr("id", "daylight")
              .append("path")
              .attr("class", "daylight")
              .attr("opacity", 0)
              .attr("d", path4proj);

  dl.transition().duration(500).attr("opacity", 0.3)
  dl.datum(circle.center(antipode(solarPosition(new Date(nownow))))).attr("d", path4proj);
};
