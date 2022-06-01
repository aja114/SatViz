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
    console.log(data);
    
    ctx.currentSat = data[4].map(function (d) {
      s = satellite.twoline2satrec(d.line1, d.line2)
      return satellite.twoline2satrec(d.line1, d.line2)
    })

    ctx.satMapping = {}
    ctx.satcat = data[5].map(function (d, i) {
      l = d.LAUNCH !== null ? d3.timeFormat('%Y-%q')(d3.timeParse('%Y-%m-%d')(d.LAUNCH)) : null
      dec = d.DECAY !== null ? d3.timeFormat('%Y-%q')(d3.timeParse('%Y-%m-%d')(d.DECAY)) : null
      var sat = {
        'id': d.NORAD_CAT_ID,
        'object_id': d.OBJECT_ID,
        'name': d.SATNAME,
        'launch_date': d.LAUNCH,
        'launch_quarter': l,
        'decay_date': dec,
        'country': d.COUNTRY,
        'apogee': d.APOGEE,
        'inclination': d.INCLINATION,
        'perigee': d.PERIGEE,
        'period': d.PERIOD,
        'launch_site': d.LAUNCH_SITE,
        'object_type': d.OBJECT_TYPE
      }
      ctx.satMapping[parseInt(d.NORAD_CAT_ID)] = i
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
