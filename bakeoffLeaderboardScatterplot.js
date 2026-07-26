//IIFE
(function() {
    var margin = { top: 100, right: 30, bottom: 120, left: 80 };

    // append the svg object to the body of the page
    var svg = d3.select("#leaderboardScatter")
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
                technical: d.technical,
                search_value: d.search_post_air_avg === "" ? NaN : +d.search_post_air_avg,
                post_count: d.r_reddit_raw_post_count === "" ? NaN : +d.reddit_raw_post_count,
            }
        }).then(function(data) {
            chartData = data.filter(d => !isNaN(d.search_value) && !isNaN(d.post_count));
            drawChart();
            window.addEventListener('resize', drawChart);
    });

    function drawChart() {

    // get the current width of the div where the chart appear, and attribute it to Svg
        var currentWidth = parseInt(d3.select('#leaderboardScatter').style('width'), 10)
        var currentHeight = parseInt(d3.select('#leaderboardScatter').style('height'), 10)
        
        var width = currentWidth - margin.left - margin.right;
        var height = currentHeight - margin.top - margin.bottom;


        svg.attr('viewBox', '0 0 ' + currentWidth + ' ' + currentHeight)
            .attr('preserveAspectRatio', 'xMinYMin meet');

        g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        g.selectAll("*").remove();

        rc = rough.svg(svg.node());

        // Add X axis
        var x = d3.scaleLinear()
            .range([ 0, width ])
            .domain([0, d3.max(chartData, d => d.search_value)]).nice();

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)).attr("font-size", "14px");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.post_count)]).nice()
            .range([ height, 0 ]);

        g.append("g")
            .call(d3.axisLeft(y)).attr("font-size", "14px");

        g.append("text")
            .attr("x", width / 2)
            .attr("y", height + 45)
            .attr("text-anchor", "middle")
            .style("font-size", "clamp(14px, 2vw, 18px)")
            .text("Post-air search interest");

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .style("font-size", "clamp(14px, 2vw, 18px)")
            .text("Reddit post count");

        // Add dots
        var pointsGroup = g.append("g").attr("class", "rough-points");

        var simulationNodes = chartData.map(d => ({
            ...d,
            x: x(d.search_value),
            y: y(d.post_count),
            targetX: x(d.search_value),
            targetY: y(d.post_count),
        }));

        d3.forceSimulation(simulationNodes)
            .force("x", d3.forceX(d => d.targetX).strength(0.8))
            .force("y", d3.forceY(d => d.targetY).strength(0.8))
            .force("collide", d3.forceCollide(5))
            .stop()
            .tick(100);


        chartData.forEach((d, i) => {
            var cx = simulationNodes[i].x;
            var cy = simulationNodes[i].y;

            var node = rc.circle(cx, cy, 28, {
                fill: "#629b95",
                fillStyle: "hachure",
                roughness: 1,
                seed: i + 1,
            });

            pointsGroup.node().appendChild(node);

            node.addEventListener("mouseenter", function() {
                showAnnotation(cx, cy, d.technical);
            });

            node.addEventListener("mouseleave", function() {
                removeAnnotation();
            });
});

        var annotationGroup = null;

        function showAnnotation(pointX, pointY, label) {
            removeAnnotation(); // clear any previous one first

            annotationGroup = g.append("g").attr("class", "annotation");

            var labelX = pointX + (pointX > width * 0.7 ? -90 : 40);
            var labelY = pointY - 20;

            var arrowNode = rc.line(labelX, labelY + 8, pointX, pointY, {
                stroke: "#223843",
                strokeWidth: 1.5,
                roughness: 1.3,
            });
            annotationGroup.node().appendChild(arrowNode);

            var angle = Math.atan2(pointY - labelY, pointX - labelX);
            var headLength = 8;
            var head1 = rc.line(
                pointX, pointY,
                pointX - headLength * Math.cos(angle - Math.PI / 7),
                pointY - headLength * Math.sin(angle - Math.PI / 7),
                { stroke: "#223843", strokeWidth: 1.5, roughness: 1.3 }
            );
            var head2 = rc.line(
                pointX, pointY,
                pointX - headLength * Math.cos(angle + Math.PI / 7),
                pointY - headLength * Math.sin(angle + Math.PI / 7),
                { stroke: "#223843", strokeWidth: 1.5, roughness: 1.3 }
            );
            annotationGroup.node().appendChild(head1);
            annotationGroup.node().appendChild(head2);

            // label
            annotationGroup.append("text")
                .attr("x", labelX)
                .attr("y", labelY)
                .attr("font-family", "'Homemade Apple', cursive")
                .attr("font-size", "14px")
                .attr("fill", "#223843")
                .text(label);
        }

            function removeAnnotation() {
                if (annotationGroup) {
                    annotationGroup.remove();
                    annotationGroup = null;
                }
            }
        }
})();
