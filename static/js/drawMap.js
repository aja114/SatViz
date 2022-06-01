var drawMap = function (countries, lakes, rivers, oceans) {
  var mapSvg = d3.select('g#map')
  var oceansG = mapSvg.append('g').attr('id', 'oceans')

  oceansG.selectAll('path.oceans')
            .data(oceans.features)
            .enter()
            .append('path')
            .attr('d', path4proj)
            .attr('class', 'ocean')
            .attr('fill', '#fff')
            .on('click', function (event, d) { clearInfo() })

  var countryG = mapSvg.append('g').attr('id', 'countries')
  countryG.selectAll('path.country')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('d', path4proj)
            .attr('class', 'country')
            .on('click', function (event, d) { clearInfo() })

  var lakeG = mapSvg.append('g').attr('id', 'lakes')
  lakeG.selectAll('path.lakes')
         .data(lakes.features)
         .enter()
         .append('path')
         .attr('d', path4proj)
         .attr('class', 'lake')
         .on('click', function (event, d) { clearInfo() })

  var riverG = mapSvg.append('g').attr('id', 'rivers')
  riverG.selectAll('path.rivers')
         .data(rivers.features)
         .enter()
         .append('path')
         .attr('d', path4proj)
         .attr('class', 'river')
  ctx.mapG = mapSvg
}

var animationButton = function(mapSvg){
  var topMargin = 60;
  var size = 30;
  mapSvg.append('text')
        .attr('x', 0)
        .attr('y', topMargin)
        .attr('font-family', 'Verdana')
        .attr('font-size', 12)
        .text('Modify Animation:');

  topMargin += 12;

  mapSvg.append('rect')
        .attr('id', 'mybutton')
        .attr('x', 0)
        .attr('y', topMargin)
        .attr('width', size)
        .attr('height', size/2)
        .on('mouseover', function () { d3.select(this).style('fill-opacity', 0.4) })
        .on('mouseout', function () { d3.select(this).style('fill-opacity', 0.1) })
        .on('click', () => { ctx.mapUpdate = setInterval(updateSatsMap, ctx.UPDATE_INTERVALS); })

  mapSvg.append('text')
        .attr('x', 3)
        .attr('y', topMargin+1.2*size/3)
        .attr('font-family', 'Verdana')
        .attr('font-size', 12)
        .text("ON")

  mapSvg.append('rect')
        .attr('id', 'mybutton')
        .attr('x', 1.3*size)
        .attr('y', topMargin)
        .attr('width', size)
        .attr('height', size/2)
        .on('mouseover', function () { d3.select(this).style('fill-opacity', 0.4) })
        .on('mouseout', function () { d3.select(this).style('fill-opacity', 0.1) })
        .on('click', () => { clearInterval(ctx.mapUpdate); })

  mapSvg.append('text')
        .attr('x', 3+1.3*size)
        .attr('y', topMargin+1.2*size/3)
        .attr('font-family', 'Verdana')
        .attr('font-size', 12)
        .text("OFF")
}

var loadGeo = function (svgEl) {
    // g containg all the map elements
  var mapSvg = svgEl.append('g')
                      .attr('x', 0)
                      .attr('y', 0)
                      .attr('width', ctx.map_w)
                      .attr('height', ctx.map_h)
                      .attr('id', 'map')
}
