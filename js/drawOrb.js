var drawOrb = function (d) {
  removeOrb()

  orb = d3.select('g#map')
            .append('g')
            .attr('id', 'orbit')
            .attr('fill', 'none')

  date = new Date()

  data = []
  i = 0
  date.setMinutes(date.getMinutes() + 2)
  var positionEci = satellite.propagate(d, date).position
  var gmst = satellite.gstime(date)
  var positionGd = satellite.eciToGeodetic(positionEci, gmst)
  var lon = satellite.degreesLong(positionGd.longitude)
  var lat = satellite.degreesLat(positionGd.latitude)
  xy = PROJECTIONS.ER([lon, lat])
  i++
  while (i < 360) {
    date.setMinutes(date.getMinutes() + 2)
    var positionEci = satellite.propagate(d, date).position
    var gmst = satellite.gstime(date)
    var positionGd = satellite.eciToGeodetic(positionEci, gmst)
    var lon = satellite.degreesLong(positionGd.longitude)
    var lat = satellite.degreesLat(positionGd.latitude)
    var xy_next = PROJECTIONS.ER([lon, lat])
    data.push([xy, xy_next])
    xy = xy_next
    i++
  }

  orb.selectAll("line")
     .data(data)
     .enter()
     .append("line")
     .attr("x1", d=> d[0][0])
     .attr("y1", d=> d[0][1])
     .attr("x2", d=> d[1][0])
     .attr("y2", d=> d[1][1])
     .attr('stroke', ctx.SELECTED_COLOR)
     .attr('stroke-width', 1)
     .attr('opacity', d=> ((d[0][0]-d[1][0])**2+(d[0][1]-d[1][1])**2)**0.5>70?0:1)

}

var removeOrb = function () {
  d3.select('g#map g#orbit').remove()
}
