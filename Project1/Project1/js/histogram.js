class Histogram {

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

    vis.xScale = d3.scaleLinear()
      .range([0, vis.width])
      .nice();

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(10)
        .tickSizeOuter(0)
        .tickPadding(10);

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(10)
        .tickSizeOuter(0)
        .tickPadding(10);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth + vis.config.margin.left + vis.config.margin.right)
        .attr('height', 375)
        .attr('transform', `translate(0,0)`);      

    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
        
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    vis.chart.append("g")
        .append("text")
        .attr("y", vis.height + 10 + vis.config.margin.top)
        .attr("x", vis.width/2 + vis.config.margin.left)
        .attr("text-anchor", "end")
        .attr("font-size", "15px")
        .text("Distance to Earth (Parsecs)");

    vis.chart.append("text")
        .attr("transform", "translate(0,-70)")
        .attr("x", vis.width/2)
        .attr("y", 50)
        .attr("font-size", "15px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Exoplanet Distance to Earth");

    vis.chart.append("g")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", -vis.height/2 + vis.config.margin.bottom)
        .attr("dy", "-5.1em")
        .attr("text-anchor", "end")
        .attr("font-size", "15px")
        .text("Number of Exoplanets");


    vis.updateVis();

  }


  //leave this empty for now
 updateVis() { 
    let vis = this;

    vis.xScale.domain([d3.min(vis.data, d => d.distance), d3.max(vis.data, d => d.distance)]);

    vis.histogram = d3.histogram()
      .value(function(d) {return d.distance})   // I need to give the vector of value
      .domain(vis.xScale.domain())  // then the domain of the graphic
      .thresholds(20); // then the numbers of bins

    vis.bins = vis.histogram(vis.data);

    vis.yScale.domain([0, d3.max(vis.bins, function(d) { return d.length; })]);
      
    vis.chart.select('.x-axis')
      .call(vis.xAxis.tickFormat(d3.format("d")));

    vis.chart.select('.y-axis')
        .call(vis.yAxis);

    vis.chart.selectAll("rect")
      .data(vis.bins)
      .join("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + vis.xScale(d.x0) + "," + vis.yScale(d.length) + ")"; })
        .attr("width", function(d) { return vis.xScale(d.x1) - vis.xScale(d.x0) -1 ; })
        .attr("height", function(d) { return vis.height - vis.yScale(d.length); })
        .style("fill", "#4682B4");
 }

}