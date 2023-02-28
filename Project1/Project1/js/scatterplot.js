class ScatterPlot {

  constructor(_config, _data) {
    this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 400,
        containerHeight: _config.containerHeight || 300,
        margin: _config.margin || {top: 40, right: 10, bottom: 60, left: 75}
    }

    this.data = _data;

    // Call a class function
    this.initVis();
  }

  initVis() {
      
    let vis = this; //this is a keyword that can go out of scope, especially in callback functions, 
                    //so it is good to create a variable that is a reference to 'this' class instance

    //set up the width and height of the area where visualizations will go- factoring in margins               
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    //reusable functions for x and y 
        //if you reuse a function frequetly, you can define it as a parameter
        //also, maybe someday you will want the user to be able to re-set it.
    vis.xValue = d => d.radius; 
    vis.yValue = d => d.mass;

    //setup scales
    vis.xScale = d3.scaleLinear()
        .domain(d3.extent(vis.data, vis.xValue)) //d3.min(vis.data, d => d.year), d3.max(vis.data, d => d.year) );
        .range([0, vis.width]);

    vis.yScale = d3.scalePow()
        .exponent(0.2)
        .domain([0, 250000])
        .range([vis.height, 0]);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth + vis.config.margin.left + vis.config.margin.right)
        .attr('height', 375)
        .attr('transform', `translate(0,0)`);


    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);


    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(15)
        .tickSizeOuter(0)
        .tickPadding(10);

    vis.yAxis = d3.axisLeft(vis.yScale)
        .tickValues([50, 250, 1250, 6250, 31250, 156250, 250000])
        .tickSizeOuter(0)
        .tickPadding(10);

    // Append x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);

    vis.chart.append("text")
        .attr("transform", "translate(0,-70)")
        .attr("x", vis.width/2)
        .attr("y", 50)
        .attr("font-size", "15px")
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text("Exoplanet Radius Vs Exoplanet Mass");

    vis.chart.append("g")
        .append("text")
        .attr("y", vis.height + 10 + vis.config.margin.top)
        .attr("x", vis.width/2 + vis.config.margin.left)
        .attr("text-anchor", "end")
        .attr("font-size", "15px")
        .text("Radius (Earth Radius)");

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    vis.chart.append("g")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", -vis.height/2 + vis.config.margin.bottom)
        .attr("dy", "-5.1em")
        .attr("text-anchor", "end")
        .attr("font-size", "15px")
        .text("Mass (Earth Mass)");


    vis.updateVis();


  }


  //leave this empty for now
 updateVis() { 
    let vis = this;

    vis.chart.select('.x-axis')
        .call(vis.xAxis.tickFormat(d3.format("d")));

    vis.chart.select('.y-axis')
        .call(vis.yAxis);

    vis.chart.selectAll("circle")
        .data(vis.data)
        .join("circle")
            .attr("cx", d => vis.xScale(vis.xValue(d)))
            .attr("cy", d => vis.yScale(vis.yValue(d)))
            .attr("r", 1.5)
            .attr("class", d => {
                if ('f' in d) {
                    return "inactive";
                }
                
                return "";
            })
            .style("fill", d => {
                if (d['exo'] == true) {
                        return "#4682B4";
                }
                else {
                    return "#f52fd4";
                }
            })
    console.log(vis.chart.selectAll("circle.inactive").size());
 }

}