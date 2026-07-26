//IIFE
(function() {
  // define margin
  var margin = { top: 200, right: 30, bottom: 100, left: 100 };

  // append the svg object to the body of the page
  var svg = d3.select("#hero_linechart")
    .append("svg")
      .attr("width", '100%')
      .attr("height", '100%');
    
  var g =  svg.append("g");
  var rc;

  //load the data
  var chartData; 
  var airdate;

  d3.csv("./data/complete/trend_data_for_linecharts.csv",
      function(d){
          return {
            date: d3.timeParse("%Y-%m-%d")(d.date),
            value : +d.value,
            technical: d.technical,
            day_offset: +d.day_offset,
          }
      }).then(function(data) {

        chartData = data.filter(d => d.technical === " fondant fancies");
        drawChart();
        window.addEventListener('resize', drawChart);

        drawSmallMultiples(data);
        window.addEventListener('resize', () => drawSmallMultiples(data));
      
      });

  function drawChart() {

    // get the current width of the div where the chart appear, and attribute it to Svg
    var currentWidth = parseInt(d3.select('#hero_linechart').style('width'), 10)
    var currentHeight = parseInt(d3.select('#hero_linechart').style('height'), 10)
      
    var width = currentWidth - margin.left - margin.right;
    var height = currentHeight - margin.top - margin.bottom;

    svg.attr('viewBox', '0 0 ' + currentWidth + ' ' + currentHeight)
      .attr('preserveAspectRatio', 'xMinYMin meet');

    g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.selectAll("*").remove();
    rc = rough.svg(svg.node());

    var x = d3.scaleLinear()
      .domain(d3.extent(chartData, d=> d.day_offset))
      .range([ 0, width ]);

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)).attr("font-size", "clamp(8px, 2vw, 14px)");

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(chartData, function(d) { return +d.value; })])
      .range([ height, 0 ]);

    g.append("g")
      .call(d3.axisLeft(y)).attr("clamp(8px, 2vw, 14px)");

    g.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "clamp(12px, 2vw, 24px)")
        .style("fill", "#1D1E2C")
        .text("Search Data for Fondant Fancies Spikes");

    g.append("text")
        .attr("class", "y-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .style("font-size", "clamp(14px, 2vw, 18px)")
        .text("Google Search Trend Share");

    g.append("text")
        .attr("class", "x-label")
        .attr("x", width/2)
        .attr("y", height + 60)
        .attr("text-anchor", "middle")
        .style("font-size", "clamp(14px, 2vw, 18px)")
        .text("Days Since Episode Air");

    drawAirateLine();

    function drawAirateLine() {
      g.append("line")
        .attr("class", "airdate-line")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y1", -20)
        .attr("y2", height)
        .attr("stroke", "#223843cc")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,8");

      g.append("text")
        .attr("x", x(0))
        .attr("y", -32)
        .attr("text-anchor", "middle")
        .attr("font-size", "clamp(8px, 2vw, 14px)")
        .attr("font", "")
        .text("air date");

    // rough.js line 
    var points = chartData.map(d => [x(d.day_offset), y(d.value)]);

    var lineGroup = g.append("g").attr("class", "rough-line");

    var lineNode = rc.linearPath(points, {
      stroke: "#c4afcc",
      strokeWidth: 2.5,
      roughness: 1.2,
      seed: 8,
    });

    lineGroup.node().appendChild(lineNode);
}

    }

  function drawSmallMultiples(data) {

    var container = d3.select("#small-multiples-grid");
    container.selectAll("*").remove(); // clear on redraw/resize

    var technicals = [...new Set(data.map(d => d.technical))];

    // shared y domain across ALL technicals, so magnitude is comparable
    var yMax = d3.max(data, d => d.value);

    technicals.forEach(function(tech, i) {

      var techData = data.filter(d => d.technical === tech);

      var cell = container.append("div").attr("class", "multiple-cell");
      cell.append("h4").text(tech.trim());

      var cellWidth = 180;
      var cellHeight = 100;
      var cellMargin = { top: 10, right: 10, bottom: 10, left: 10 };
      var innerWidth = cellWidth - cellMargin.left - cellMargin.right;
      var innerHeight = cellHeight - cellMargin.top - cellMargin.bottom;

      var svg = cell.append("svg")
        .attr("width", '100%')
        .attr("height", '100%')
        .attr('viewBox', '0 0 ' + cellWidth + ' ' + cellHeight)
        .attr('preserveAspectRatio', 'xMinYMin meet');

      var g = svg.append("g")
        .attr("transform", "translate(" + cellMargin.left + "," + cellMargin.top + ")");

      var cellRc = rough.svg(svg.node());

      var x = d3.scaleLinear()
        .domain([-7, 7])
        .range([0, innerWidth]);

      var y = d3.scaleLinear()
        .domain([0, yMax])
        .range([innerHeight, 0]);

      // air date marker
      g.append("line")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#223843cc")
        .attr("stroke-width", 1);

      var points = techData.map(d => [x(d.day_offset), y(d.value)]);

      var lineNode = cellRc.linearPath(points, {
        stroke: "#c4afcc",
        strokeWidth: 3,
        roughness: .8,
        seed: i + 1, // unique but stable seed per small multiple
      });

      g.node().appendChild(lineNode);

    });
  }


})();



