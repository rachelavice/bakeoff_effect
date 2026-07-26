//IIFE
(function() {
    var margin = { top: 60, right: 30, bottom: 120, left: 80 };

    // append the svg object to the body of the page
    var svg = d3.select("#historicalBarChart")
    .append("svg")
        .attr("width", '100%')
        .attr("height", '100%');
    
    var g =  svg.append("g");
    var rc;

    //load the data
    var chartData; 

    d3.csv("./data/complete/bakeoff_project_master_data.csv",
        function(d){
            return {
            value : +d.search_post_air_avg,
            technical: d.technical,
            historical_bake: d.is_historical_bake,
            }
        }).then(function(data) {

        chartData = data.filter(d => d.historical_bake === "True").slice(0,6);
        drawChart();
        window.addEventListener('resize', drawChart);

        
        });

    function drawChart() {

    // get the current width of the div where the chart appear, and attribute it to Svg
        var currentWidth = parseInt(d3.select('#historicalBarChart').style('width'), 10)
        var currentHeight = parseInt(d3.select('#historicalBarChart').style('height'), 10)
        
        var width = currentWidth - margin.left - margin.right;
        var height = currentHeight - margin.top - margin.bottom;


        svg.attr('viewBox', '0 0 ' + currentWidth + ' ' + currentHeight)
            .attr('preserveAspectRatio', 'xMinYMin meet');

        g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        g.selectAll("*").remove();

        rc = rough.svg(svg.node());

    // color palette
        const groups = [...new Set(chartData.map(d => d.technical))];
        const colorPalette = [
            "#ffb3ba", 
            "#FFF7AE", 
            "#cce6ff",
            "#f9d299", 
            "#629b95",
            "#c4afcc",
        ];

        const colorScale = d3.scaleOrdinal()
            .domain(groups)
            .range(colorPalette);

        var x = d3.scaleBand()
            .range([ 0, width ])
            .domain(chartData.map(d => d.technical))
            .padding(0.2)

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)).attr("font-size", "14px")
            .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

    // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 35])
            .range([ height, 0 ]);

        g.append("g")
            .call(d3.axisLeft(y)).attr("font-size", "14px");

        var barsGroup = g.append("g").attr("class", "bars");

        g.append("text")
            .attr("class", "chart-title")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "clamp(12px, 2vw, 24px)")
            .style("fill", "#1D1E2C")
            .text("Obscure Bakes See Renewed Interest");

        g.append("text")
            .attr("class", "y-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -60)
            .attr("text-anchor", "middle")
            .style("font-size", "clamp(14px, 2vw, 18px)")
            .text("Google Search Trend Share");

    // Bars with rough js library to make them look sketchy 
        chartData.forEach((d, i) => {
            var barX = x(d.technical);
            var barWidth = x.bandwidth();
            var barY = y(d.value);
            var barHeight = height - y(d.value);

            var barNode = rc.rectangle(barX, barY, barWidth, barHeight, {
                fill: colorScale(d.technical),
                fillStyle: 'hachure',
                roughness: 1.4,
                seed: i + 1, // fixed seed so it doesn't redraw differently every render
            });

            // Grow-in animation: reveal via clip-path instead of tweening height
            barNode.setAttribute("clip-path", `inset(100% 0 0 0)`);
            barNode.style.transition = `clip-path 0.8s ease ${i * 0.1}s`;

            barsGroup.node().appendChild(barNode);

            // trigger the transition on next frame
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    barNode.setAttribute("clip-path", "inset(0% 0 0 0)");
                });
            });
        });
    }
})();