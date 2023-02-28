class LineGraph {

  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 800,
      containerHeight: _config.containerHeight || 225,
      margin: _config.margin || {top: 20, right: 30, bottom: 30, left: 75}
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

    vis.xValue = d => d.x; 
    vis.yValue = d => d.y;

    //setup scales
    vis.xScale = d3.scaleLinear()
        .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0])
        .nice(); //this just makes the y axes behave nicely by rounding up

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', 1500)
        .attr('height', 300)
        .attr("transform", "translate(0,0)");

    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.width/2},${vis.config.margin.top + vis.config.margin.bottom})`);

    vis.xAxis = d3.axisBottom(vis.xScale);
    vis.yAxis = d3.axisLeft(vis.yScale);

    // Append x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
        
    vis.chart.append("text")
        .attr("transform", "translate(0,-70)")
        .attr("x", vis.width/2)
        .attr("y", 50)
        .attr("font-size", "15px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Exoplanet Discoveries Over Time");
    
    vis.chart.append("g")
        .append("text")
        .attr("y", 225)
        .attr("x", vis.width/2)
        .attr("text-anchor", "end")
        .attr("font-size", "15px")
        .text("Years");
 
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    vis.chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 25)
        .attr("x", -70)
        .attr("dy", "-5.1em")
        .attr("text-anchor", "end")
        .attr("font-size", "15px")
        .text("Discoveries");
    
    vis.updateVis();
  }

 updateVis() { 
    let vis = this;

    vis.xScale.domain(d3.extent(vis.data, vis.xValue))
    vis.yScale.domain(d3.extent(vis.data, vis.yValue))

    vis.chart.select('.x-axis')
        .call(vis.xAxis.tickFormat(d3.format("d")))
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)"); 
    
    vis.chart.select('.y-axis') 
        .call(vis.yAxis);

    vis.line = d3.line()
        .x(d => vis.xScale(vis.xValue(d)))
        .y(d => vis.yScale(vis.yValue(d)));

    vis.chart.selectAll(".line")
        .data([vis.data])
        .join('path')
        .attr('class', 'line')
        .attr('stroke-width', 2)
        .attr('d', vis.line);
 }

}