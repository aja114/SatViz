var ctx = {
  w: 1100,
  h: 900,
  map_w: 800,
  map_h: 460,
  chart_w: 760,
  chart_h: 380,
  info_w: 280,
  info_h: 460,
  extra_w: 280,
  extra_h: 380,
  sep: 20,
  margin: 20,
  UPDATE_INTERVALS: 1000,
  ACTIVE_COLOR: "#007400",
  DECAYED_COLOR: "#c55503",
  SELECTED_COLOR: "#ffab00",
  TOTAL_COLOR: "#1c46ae",
  scale: 1,
  planeUpdater: null,
  counter: 1,
  dateFormatter: d3.timeFormat('%Y-%m-%d'),
  timeFormatter: d3.timeFormat('%Y-%m-%d %H:%M:%S'),
  ISS_COLOR: 'pink',
  ISS_SIZE: 30,
  ISS: '25544',
  updateSpeed: 1
}


const PROJECTIONS = {
  ER: d3.geoNaturalEarth1().center([0, 0]).scale(ctx.map_w / (2 * Math.PI)).translate([ctx.map_w / 2, ctx.map_h / 2])
}

var path4proj = d3.geoPath()
                  .projection(PROJECTIONS.ER)

var createViz = function () {
    // Create the main svg element
  var svgEl = d3.select('#main')
                  .append('svg')
                  .attr('width', ctx.w)
                  .attr('height', ctx.h)

    // g containg all the chart elements
  var chartSvg = svgEl.append('g')
                        .attr('transform', 'translate(0,' + (ctx.map_h + ctx.sep) + ')')
                        .attr('id', 'chart')
                        .attr('width', ctx.chart_w)
                        .attr('height', ctx.chart_h)

  loadGeo(svgEl)
  drawInfo(svgEl)
  drawLegend(svgEl)
  loadData(svgEl)
}
