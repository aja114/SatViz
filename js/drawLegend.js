var drawLegend = function (svgEl) {
  var legendSvg = svgEl.append('g')
                       .attr('id', 'legend')
                       .attr('transform', 'translate(' + (ctx.map_w + ctx.sep) + ',' + (ctx.map_h + ctx.sep) + ')')
                       .attr('width', ctx.extra_w)
                       .attr('height', ctx.extra_h)
}

var seriesLegend = function () {
  // Create the legend
  var size = 30
  const xMargin = 3
  const yMargin = 3
  var top = 0

  legend = d3.select('g#legend')

  legend.append('text')
        .attr('x', xMargin)
        .attr('y', top + 3 * yMargin)
        .text('Map Legend')
        .attr('text-anchor', 'left')
        .style('alignment-baseline', 'middle')

  top += size + yMargin

  ctx.marks.forEach((item, i) => {
    legend.append('path')
            .attr('x', 3)
            .attr('d', item.generator.size(150))
            .attr('transform', 'translate(' + (xMargin + size / 2) + ',' + (top + size / 5) + ')')
            .style('fill', item.color)

    legend.append('text')
            .attr('x', size * 1.3 + xMargin)
            .attr('y', top + (size / 4))
            .style('fill', item.color)
            .text(item.name)
            .attr('text-anchor', 'left')
            .style('alignment-baseline', 'middle')
            .append('title')
            .text(item.description)

    top += size + yMargin
  })

  legend.append('text')
        .attr('x', xMargin)
        .attr('y', top + 3 * yMargin)
        .text('Chart Legend')
        .attr('text-anchor', 'left')
        .style('alignment-baseline', 'middle')

  top += size + yMargin

  ctx.series.forEach((item, i) => {
    legend.append('rect')
            .attr('x', xMargin)
            .attr('y', top)
            .attr('width', size)
            .attr('height', size / 3)
            .style('fill', item.color)

    legend.append('text')
            .attr('x', size * 1.3 + xMargin)
            .attr('y', top + (size / 4))
            .style('fill', item.color)
            .text(item.name)
            .attr('text-anchor', 'left')
            .style('alignment-baseline', 'middle')
            .append('title')
            .text(item.description)

    top += size + yMargin
  })

  legend.append('text')
        .attr('x', xMargin)
        .attr('y', top + 3 * yMargin)
        .text('Alter the Visualisation')
        .attr('text-anchor', 'left')
        .style('alignment-baseline', 'middle')

  top += size + yMargin

  legend.append('rect')
        .attr('id', 'mybutton')
        .attr('x', xMargin)
        .attr('y', top)
        .attr('width', 4 * size)
        .attr('height', 2.5 * size / 3)
        .on('mouseover', function () { d3.select(this).style('fill-opacity', 0.4) })
        .on('mouseout', function () { d3.select(this).style('fill-opacity', 0.1) })
        .on('click', () => { ctx.onlyPayload = 1; updateSatsMap(); })

  legend.append('text')
        .attr('x', 1.4 * xMargin)
        .attr('y', top + 1.8 * size / 3)
        .attr('font-family', 'Verdana')
        .attr('font-size', 12)
        .text('Show Payload Only')

  top += 2.5 * size / 2 + yMargin

  legend.append('rect')
        .attr('id', 'mybutton')
        .attr('x', xMargin)
        .attr('y', top)
        .attr('width', 4 * size)
        .attr('height', 2.5 * size / 3)
        .on('mouseover', function () { d3.select(this).style('fill-opacity', 0.4) })
        .on('mouseout', function () { d3.select(this).style('fill-opacity', 0.1) })
        .on('click', () => { ctx.onlyPayload = 0; updateSatsMap(); })

  legend.append('text')
        .attr('x', 1.4 * xMargin)
        .attr('y', top + 1.8 * size / 3)
        .attr('font-family', 'Verdana')
        .attr('font-size', 12)
        .text('Show all')
}
