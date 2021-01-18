var information = [
  ['Current Time: ', 'time'],
  ['Satellite Name: ', 'name', 'name', 'Name given to the satellite'],
  ['Satellite Number: ', 'id', 'object_id', 'Unique identifier of the object'],
  ['Object Type: ', 'object_type', 'object_type', 'Payload, Debris or Rocket Body'],
  ['Country owner: ', 'country', 'country', 'The nation or group that has responsibility for an object'],
  ['Launched Year: ', 'launch', 'launch_date', 'Object launched date in YYYY-MM-DD format'],
  ['Launched from: ', 'site', 'launch_site', 'Launching site of the object'],
  ['Period (minutes): ', 'period', 'period', 'The number of minutes an object takes to make one full orbit'],
  ['Perigee (km): ', 'perigee', 'perigee', 'Point in the orbit where an Earth satellite is closest to the Earth'],
  ['Apogee (km): ', 'apogee', 'apogee', 'Point in the orbit where an Earth satellite is farthest from the Earth'],
  ['Inclination (degrees): ', 'inclination', 'inclination', 'The angle between the equator and the orbit plane'],
  ['Current Lattitude (degrees): ', 'lat', 'lat', 'Lattitude of the object at the current time'],
  ['Current Longitude (degrees): ', 'lon', 'lon', 'Longitude of the object at the current time']
]

const topMargin = 60
const space = 30

var updateInfo = function (data) {
  drawOrb(data)
  id = ctx.satMapping[parseInt(data.satnum)]
  ctx.selectedSat = data.satnum
  information.forEach((d, i) => {
    if (i >= 1) {
      if (ctx.satcat[id][d[2]] !== undefined) {
        d3.select('g#info text#' + d[1])
          .text(d[0] + ctx.satcat[id][d[2]])
          .append('title')
          .text(d[3])
      }
    }
  })
  _ = getSatTransform(data)
}

var updateInfoCoord = function (lon, lat) {
  d3.select('g#info text#lon')
    .text('Current Longitude: ' + lon)
    .append('title')
    .text('Longitude of the object at the current time')

  d3.select('g#info text#lat')
    .text('Current Lattitude: ' + lat)
    .append('title')
    .text('Lattitude of the object at the current time')
}

var clearInfo = function () {
  removeOrb()
  ctx.selectedSat = null
  information.forEach((d, i) => {
    if (i >= 1) {
      d3.select('g#info text#' + d[1])
        .text(d[0])
        .append('title')
        .text(d[3])
    };
  })
}

var updateTime = function (curTime) {
  time = d3.select('g#info text#time')
             .text(information[0][0] + ctx.timeFormatter(curTime))
}

var drawInfo = function (svgEl) {
  var infoSvg = svgEl.append('g')
                     .attr('id', 'info')
                     .attr('transform', 'translate(' + (ctx.map_w + ctx.sep) + ',0)')
                     .attr('width', ctx.info_w)
                     .attr('height', ctx.info_h)

  information.forEach((d, i) => {
    infoSvg.append('text')
            .attr('transform', 'translate(0,' + (i * space + topMargin) + ')')
            .attr('id', d[1])
            .text(d[0])
            .append('title')
            .text(d[3])
  })
}
