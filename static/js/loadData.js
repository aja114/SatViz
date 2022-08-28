var loadData = function (svgEl) {
  // Replace the file in promise to show either french satellites or the world's
  var satPromises = [
    d3.json('/data/active_french'),
    d3.json('/data/catalogue')
  ]

  var geoPromises = [
    d3.json('/data/geo_countries'),
    d3.json('/data/geo_lakes'),
    d3.json('/data/geo_rivers'),
    d3.json('/data/geo_oceans')
  ]

  Promise.all(geoPromises.concat(satPromises)).then(function (data) {
    ctx.currentSat = data[4].map(function (d) {
      s = satellite.twoline2satrec(d.line1, d.line2)
      return satellite.twoline2satrec(d.line1, d.line2)
    })

    ctx.satMapping = {}
    ctx.satcat = data[5].map(function (d, i) {
      launch = d.launch !== "" ? d3.timeFormat('%Y-%q')(d3.timeParse('%Y-%m-%d')(d.launch)) : null
      decay = d.decay !== "" ? d3.timeFormat('%Y-%q')(d3.timeParse('%Y-%m-%d')(d.decay)) : null
      var sat = {
        'id': d.norad_cat_id,
        'object_id': d.object_id,
        'name': d.satname,
        'launch_date': d.launch,
        'launch_quarter': launch,
        'decay_date': decay,
        'country': d.country,
        'apogee': d.apogee,
        'inclination': d.inclination,
        'perigee': d.perigee,
        'period': d.period,
        'launch_site': d.site,
        'object_type': d.object_type
      }
      ctx.satMapping[parseInt(d.norad_cat_id)] = i
      return sat
    })
    ctx.range = d3.extent(data[5], (d) => (d3.timeParse('%Y-%m-%d')(d.LAUNCH)))

    ctx.onlyPayload = 0

    drawMap(data[0][0], data[1][0], data[2][0], data[3][0])
    addDaylight()
    drawSatsMap()
    drawSatsChart()
  }).catch(function (error) { console.log(error) })
}
