const initialSelection = [new Date(2010, 0, 01), new Date(2020, 9, 01)]

const GLYPH_SIZE = 30;
const crossGen = d3.symbol().type(d3.symbolWye).size(GLYPH_SIZE);
const circleGen = d3.symbol().type(d3.symbolCircle).size(GLYPH_SIZE);
const triangleGen = d3.symbol().type(d3.symbolSquare).size(GLYPH_SIZE);

var drawSatsMap = function() {
    ctx.marks = [
      {"type": "PAYLOAD", "generator": d3.symbol().type(d3.symbolWye),
      "name": "Payload", "color": ctx.ACTIVE_COLOR, "description": "A satellite still serving the purpose for which it was sent is considered a payload."},
      {"type":"DEBRIS", "generator": d3.symbol().type(d3.symbolCircle),
      "name":"Debris", "color": ctx.ACTIVE_COLOR, "description": "Orbital debris are all man-made objects orbiting Earth which no longer serve a useful purpose."},
      {"type":"ROCKET BODY", "generator": d3.symbol().type(d3.symbolSquare),
      "name":"Rocket Body", "color": ctx.ACTIVE_COLOR, "description": "The propulsion unit(s) used to deploy satellites into orbit. These are cataloged differently from standard debris because they can have mechanisms or fuel on board that can affect the orbital behavior of the rocket body even after long periods of time."}
    ];

    ctx.mapG.append("g").attr("id", "sats");
    var sats = d3.select("g#sats")

    sats.selectAll("path")
          .data(ctx.currentSat, (d)=>d.satnum)
          .enter()
          .append("path")
          .attr("d", (d)=> {return getShape(d.satnum)})
          .on("click", function(event,d){updateInfo(d);})
          .attr("transform", (d)=>getSatTransform(d))
          .transition()
          .duration(1000)
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", "1px")
          .attr("fill", (d)=>getColor(d))
          .attr("opacity", (d)=>getOpacity(d));

    // ctx.mapUpdate = setInterval(updateSatsMap, ctx.UPDATE_INTERVALS);
    animationButton(ctx.mapG)
};

var drawSatsChart = function() {

  // Format the data
  launch_series = d3.rollups(ctx.satcat, v => v.length, d => d.launch_quarter)
  launch_series = launch_series.sort((a, b) => d3.ascending(a[0], b[0]));
  launch_series_cum = d3.cumsum(launch_series, d => d[1]);
  launch_series = launch_series.map(function(v, i){
        return {date:d3.timeParse("%Y-%q")(v[0]), count: (launch_series_cum[i]) }
  })

  decay_series = ctx.satcat.filter((d)=>(d.decay_date!==null));
  decay_series = d3.rollups(decay_series, v => v.length, d => d.decay_date)
  decay_series = decay_series.sort((a, b) => d3.ascending(a[0], b[0]));
  decay_series_cum = d3.cumsum(decay_series, d => d[1]);
  decay_series = decay_series.map(function(v, i){
        return { date:d3.timeParse("%Y-%q")(v[0]), count: (decay_series_cum[i]) }
  })

  active_series = ctx.satcat.filter((d)=>(d.decay_date===null));
  active_series = d3.rollups(active_series, v => v.length, d => d.launch_quarter)
  active_series = active_series.sort((a, b) => d3.ascending(a[0], b[0]));
  active_series_cum = d3.cumsum(active_series, d => d[1]);
  active_series = active_series.map(function(v, i){
        return { date:d3.timeParse("%Y-%q")(v[0]), count: (active_series_cum[i]) }
  })

  ctx.series = [
    {"data": active_series, "name": "Active Satellites",
    "color": ctx.ACTIVE_COLOR, "description": "All man made satellite currently orbit the Earth"},
    {"data": decay_series, "name": "Decayed Satellites",
    "color": ctx.DECAYED_COLOR, "description": "Satellites that have deviated from their orbit and re-entered the Earth athmosphere (maibly because of atmospheric drag)"},
    {"data": launch_series, "name": "Total Satellites",
    "color": ctx.TOTAL_COLOR, "description": "Cumulative of all the satellites ever launched" }
  ]

  // Plot the chart
  var chart = d3.select("g#chart")

  // Add X axis --> it is a date format
  var xScale = d3.scaleTime()
                 .domain(d3.extent(launch_series, (d)=>d.date))
                 .range([ctx.margin, ctx.chart_w-ctx.margin]);

   var yScale = d3.scaleLinear()
                  .domain([0, d3.max(launch_series, (d)=>d.count)])
                  .range([ctx.chart_h-ctx.margin, 0]);

  // Add x and y axis
  xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(7, d3.timeFormat("%Y-%q"));

  yAxis = d3.axisRight()
            .scale(yScale)
            .tickSize(ctx.chart_w-ctx.margin)
            .ticks(10, d3.format("s"));

  var x = chart.append("g")
               .attr("transform", "translate("+ctx.margin+"," + (ctx.chart_h-ctx.margin) + ")")
               .call(xAxis);

  var y = chart.append("g")
               .attr("id", "yaxis")

  y.attr("transform", "translate("+ctx.margin+", 0)")
    .call(yAxis)
    .call(g => g.select(".domain")
       .remove())
    .call(g => g.selectAll(".tick:not(:first-of-type) line")
       .attr("stroke-opacity", 0.5)
       .attr("stroke-dasharray", "2,2"))
    .call(g => g.selectAll(".tick text")
       .attr("x", 4)
       .attr("dy", -4))

  const linegen =  d3.line()
                     .x(d => xScale(d.date))
                     .y(d => yScale(d.count))

  y.append("text")
   .attr("fill", "black")
   .attr("x", 4)
   .attr("y", 0)
   .style("text-anchor", "start")
   .text("# of Satellites");


  // Add the line
  chartArea = chart.append("g")
                   .attr("transform", "translate("+ctx.margin+", 0)");

  ctx.series.forEach( s => {
    chartArea.append("path")
         .datum(s.data)
         .attr("stroke", s.color)
         .attr("stroke-width", 1.5)
         .attr("d", linegen);
  });

  seriesLegend()

  const brush = d3.brushX()
                  .extent([[ctx.margin, 0.5], [ctx.chart_w-ctx.margin, ctx.chart_h - 0.5]])
                  .on("end", function({selection}){
                      if(selection!==null){
                          ctx.range = selection.map((d) => xScale.invert(d-ctx.margin));
                          clearInfo();
                          updateSatsMap();
                      } else {
                          chartArea.call(brush.move, initialSelection.map(xScale));
                        };
                  });

  chartArea.call(brush).call(brush.move, initialSelection.map(xScale));
}

var updateSatsMap = function(){
  currentSat = ctx.currentSat.filter(function(d){
      if(ctx.satMapping[parseInt(d.satnum)]===undefined){
        console.log(parseInt(d.satnum));
        return false
      };
      return (ctx.range[0] <= d3.timeParse("%Y-%q")(ctx.satcat[ctx.satMapping[parseInt(d.satnum)]].launch_quarter))
          && (d3.timeParse("%Y-%q")(ctx.satcat[ctx.satMapping[parseInt(d.satnum)]].launch_quarter) <= ctx.range[1]);
      });

  sats = d3.select("g#sats")

  sats.selectAll("path")
        .data(currentSat, (d)=>d.satnum)
        .exit()
        .transition()
        .duration(100)
        .remove();

  sats.selectAll("path")
        .data(currentSat, (d)=>d.satnum)
        .transition()
        .attr("fill", (d)=>getColor(d))
        .duration(500)
        .attr("transform", (d)=>getSatTransform(d))
        .attr("opacity", (d)=>getOpacity(d));

  sats.selectAll("path")
        .data(currentSat, (d)=>d.satnum)
        .enter()
        .append("path")
        .attr("d", (d)=> {return getShape(d.satnum)})
        .on("click", function(event,d){updateInfo(d);})
        .attr("transform", (d)=>getSatTransform(d))
        .attr("fill", (d)=>getColor(d))
        .transition()
        .duration(500)
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", "1px")
        .attr("opacity", (d)=>getOpacity(d));

  date = new Date()
  updateTime(date.setSeconds(date.getSeconds() + ctx.counter))
  ctx.counter += 60/ctx.updateSpeed;
}

// Use this function to reduce the number of displayed elements if needed
function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}
