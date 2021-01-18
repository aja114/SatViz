var getShape = function (id) {
  if(ctx.satMapping[id]===undefined){
    return crossGen();
  }
  type = ctx.satcat[ctx.satMapping[id]].object_type
  if (type === ctx.marks[0]['type']) {
    return crossGen()
  } else if (type === ctx.marks[1]['type']) {
    return circleGen()
  } else if (type === ctx.marks[2]['type']) {
    return triangleGen()
  };
}

var getColor = function (d) {
  if(ctx.satMapping[parseInt(d.satnum)]===undefined){
    return ctx.ACTIVE_COLOR
  }
  if (d.satnum === ctx.selectedSat) {
    return ctx.SELECTED_COLOR
  } else if (d.satnum === ctx.ISS) {
    return ctx.ISS_COLOR
  } else {
    return ctx.ACTIVE_COLOR
  }
}

var getOpacity = function (d) {
  if(ctx.satMapping[parseInt(d.satnum)]===undefined){
    return 0
  }
  if (ctx.onlyPayload === 0) {
    return 1
  } else {
    return ctx.satcat[ctx.satMapping[d.satnum]].object_type === 'PAYLOAD' ? 1 : 0
  }
}

var getSatTransform = function (d) {
  date = new Date()
  date.setSeconds(date.getSeconds() + ctx.counter)
  // console.log(date);

  var positionEci = satellite.propagate(d, date).position

  if (d.error !== 0) { return `translate(${0},${0})` }

  var gmst = satellite.gstime(date)
  var positionGd = satellite.eciToGeodetic(positionEci, gmst)

  var lon = satellite.degreesLong(positionGd.longitude)
  var lat = satellite.degreesLat(positionGd.latitude)

  var xy = PROJECTIONS.ER([lon, lat])
  var x = xy[0]
  var y = xy[1]

  if (d.satnum === ctx.selectedSat) {
    updateInfoCoord(lon, lat)
  }
  t = `translate(${x},${y})`
  return t
}
