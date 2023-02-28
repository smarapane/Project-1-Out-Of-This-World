class BarGraph {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 400,
        containerHeight: _config.containerHeight || 300,
        margin: _config.margin || {top: 40, right: 10, bottom: 60, left: 75}
      }
      this.data = data;
      this.initVis();
    }

    initVis() {

      let vis = this;

      vis.distDistrib = vis.getDistDistrib(vis.data, 'sy_dist');
      vis.discByYear = vis.organizeData(vis.data, 'disc_year');
      vis.radisuVsMass = vis.getRadiusVsMass(vis.data);
      
      vis.histogram = new Histogram({ parentElement: '#histogram'}, vis.distDistrib);
      vis.scatterPlot = new ScatterPlot({ parentElement: '#scatterplot'}, vis.radisuVsMass);
      vis.lineGraph = new LineGraph({ parentElement: '#linegraph'}, vis.discByYear);

      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth + vis.config.margin.left + vis.config.margin.right)
          .attr('height', 375)
          .attr('transform', `translate(0,0)`);
          

      vis.xScale = d3.scaleBand()
          .range([0, vis.width])
          .padding(.4);
  
      vis.yScale = d3.scaleLinear()
          .range([vis.height, 0]);
      
      // Initialize axes
      vis.xAxis = d3.axisBottom(vis.xScale)
          .ticks(6)
          .tickSizeOuter(0)
          .tickPadding(10);
          //.tickFormat(d => d + ' km');

      vis.yAxis = d3.axisLeft(vis.yScale)
          .ticks(4)
          .tickSizeOuter(0)
          .tickPadding(10);
      
      // Append group element that will contain our actual chart (see margin convention)
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
                  
      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,${vis.height})`);
      
      // Append y-axis group
      vis.yAxisG = vis.chart.append('g')
          .attr('class', 'axis y-axis');

      vis.chart.append('g')
          .append("text")
          .attr('class', 'title');

      vis.chart.append('g')
          .append("text")
          .attr('class', 'xlabel');

      vis.chart.append('g')
          .append("text")
          .attr('class', 'ylabel');

      vis.trackingArea = vis.chart.append('rect')
          .attr('width', vis.width)
          .attr('height', vis.height)
          .attr('fill', 'none')
          .attr('pointer-events', 'all');

      vis.updateVis(0, "Number of Stars", "Number of Exoplanets", "star", "Number of Exoplanets in 'x' Star Systems", "", 'sy_snum');
      
    }

    updateVis(margin, X, Y, XUnit, Title, Link, barData) {
      let vis = this;

      if (X == "Star Types") {
        vis.barData = vis.getNumStarTypes(vis.data, barData);
      }
      else if (X == "Habitability") {
        vis.barData = vis.getHabitZones(vis.data, barData);
      }
      else {
        vis.barData = vis.organizeData(vis.data, barData);
      }

      vis.X = X;
      vis.Y = Y;
      vis.margin = margin;
      vis.XUnit = XUnit;
      vis.Title = Title;
      vis.Link = Link;

      let x = []
      let y = [];

      vis.barData.forEach(row => {
        x.push(row['x']);
        y.push(row['y']);
      });

      vis.xScale.domain(x);
      vis.yScale.domain([0, d3.max(y)]);

      vis.renderVis();
    }

    renderVis() {
      let vis = this;

      if (vis.Link != undefined && vis.Link != "") {
        vis.chart.select(".title")
            .join("text")
            .attr("transform", "translate(0,-70)")
            .attr("x", vis.width/2)
            .attr("y", 47)
            .attr("font-size", "15px")
            .attr("font-weight", "bold")
            .attr("text-decoration", "underline")
            .attr("text-anchor", "middle")
            .text(vis.Title)
            .on("mouseover", function() {d3.select(this).style("cursor", "pointer")})
            .on("mouseout", function() {d3.select(this).style("cursor", "default")})
            .on("click", function() { window.open(vis.Link); });
      }

      else {
        vis.chart.select(".title")
            .join("text")
            .attr("transform", "translate(0,-70)")
            .attr("x", vis.width/2)
            .attr("y", 47)
            .attr("font-size", "15px")
            .attr("text-decoration", "")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .text(vis.Title)
            .on("mouseover", function() {d3.select(this).style("cursor", "default")})
            .on("mouseout", function() {d3.select(this).style("cursor", "default")})
            .on("click", function() {}); 

      }
      vis.chart.select(".x-axis")
          .attr("transform", "translate(0," + vis.height + ")")
          .call(d3.axisBottom(vis.xScale).tickFormat(function(d) {
            if(d == 1) {
              return d + " " + vis.XUnit;
            }
            else if (!(isNaN(Number(d)))){
              return d + " " + vis.XUnit + "s";
            }
            return d;
          }))
          .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

      vis.chart.select(".xlabel")
          .join("text")
          .attr("y", vis.height + vis.config.margin.top + 20 + vis.margin)
          .attr("x", vis.width/2)
          .attr("text-anchor", "middle")
          .attr("font-size", "15px")
          .text(vis.X);

      vis.chart.select(".y-axis")
         .call(d3.axisLeft(vis.yScale)
         .ticks(10));
      
      vis.chart.select(".ylabel")
         .join("text")
         .attr("transform", "rotate(-90)")
         .attr("y", 30)
         .attr("x", -vis.height/2 + vis.config.margin.bottom)
         .attr("dy", "-5.1em")
         .attr("text-anchor", "end")
         .attr("font-size", "15px")
         .text(vis.Y);
      
      vis.chart.selectAll(".bar")
        .data(vis.barData)
        .join("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return vis.xScale(d.x); })
        .attr("y", function(d) { return vis.yScale(d.y); })
        .attr("width", vis.xScale.bandwidth())
        .attr("height", function(d) { return vis.height - vis.yScale(d.y); });   
        
      vis.chart.selectAll("#bargraph rect")
        .on('mouseover', (event,d) => {
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX) + 'px')   
            .style('top', (event.pageY) + 'px')
            .html(function() {
              return `${vis.X}: ${d['x']}<br>${vis.Y}: ${d['y']}`
            })  
        })
        .on('click', function(event, d) {
          d3.selectAll('.bar:not(.inactive)').each(function() {
            d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));
          });
          
          d3.select(this).classed('inactive', false);
          let cat = ""
          vis.chart.selectAll('.bar:not(.inactive)').each(function() {
            d3.selectAll('.bargraph-btn:not(.inactive)').each(function() {
              cat = d3.select(this).attr('category');
            })
          })
          vis.filter(cat, d['x']);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });        

    }

    filter(category, f) {
      let vis = this;
      let catDict = {"stars": "sy_snum", "planets": "sy_pnum", "startypes": "st_spectype", "discoverymethods": "discoverymethod", "habitable": "st_spectype"};

      vis.histogram.data = vis.getDistDistrib(vis.data, 'sy_dist', catDict[category], f);
      vis.histogram.updateVis();

      vis.scatterPlot.data = vis.getRadiusVsMass(vis.data, catDict[category], f);
      vis.scatterPlot.updateVis();

      vis.lineGraph.data = vis.organizeData(vis.data, 'disc_year', catDict[category], f)
      vis.lineGraph.updateVis();
    }
    
    organizeData(data, Y, category, f) {
      const retDict = {};
      const retArray = [];

      if (f != undefined) {
        if (category == 'st_spectype' && f.length == 1) {
          data.forEach(row => {
            if (row[category].charAt(0) == f) {
              if(!(row[Y] in retDict)) {
                retDict[row[Y]] = 1;
              }
              else {
                retDict[row[Y]] += 1;
              }
            }
          })
        }

        else if (category == 'st_spectype') {
          const habitDict = {
            "A": [8.5, 12.5],
            "F": [1.5, 2.2],
            "G": [0.95, 1.4],
            "K": [0.38, 0.56],
            "M": [0.08, 0.12],
          }
          data.forEach(row => {
            if(row[category].charAt(0) in habitDict) {
              if (f == 'Habitable' && (row['pl_orbsmax'] > habitDict[row[category].charAt(0)][0] && row['pl_orbsmax'] < habitDict[row[category].charAt(0)][1])) {
                if(!(row[Y] in retDict)) {
                  retDict[row[Y]] = 1;
                }
                else {
                  retDict[row[Y]] += 1;
                }
              }
              else if (f == 'Inhabitable' && (row['pl_orbsmax'] < habitDict[row[category].charAt(0)][0] || row['pl_orbsmax'] > habitDict[row[category].charAt(0)][1])) {
                if(!(row[Y] in retDict)) {
                  retDict[row[Y]] = 1;
                }
                else {
                  retDict[row[Y]] += 1;
                }
              }
            }
          })
        }

        else {
          data.forEach(row => {
            if (row[category] == f) {
              if(!(row[Y] in retDict)) {
                retDict[row[Y]] = 1;
              }
              else {
                retDict[row[Y]] += 1;
              }
            }
          })
        }
      }
      
      else {
        data.forEach(row => {
          if(!(row[Y] in retDict)) {
            retDict[row[Y]] = 1;
          }
          else {
            retDict[row[Y]] += 1;
          }
        })
      }
    
      for (const [key, value] of Object.entries(retDict)) {
            retArray.push(
          {
            x: key,
            y: value,
          }
        );
      }
    
      return retArray;
    }
    
    getNumStarTypes(data, Y) {
      const retDict = {};
      const retArray = [];
    
      data.forEach(row => {
        if(row[Y].charAt(0) == row[Y].charAt(0).toUpperCase()) {
          if(!(row[Y].charAt(0) in retDict)) {
            retDict[row[Y].charAt(0)] = 1;
          }
          else {
            retDict[row[Y].charAt(0)] += 1;
          }
        }
      })
    
      for (const [key, value] of Object.entries(retDict)) {
        if (['A', 'F', 'G', 'K', 'M'].includes(key)) {
          retArray.push(
            {
              x: key,
              y: value
            }
          );
        }
          }
      
      return retArray;
    }
    
    getHabitZones(data, Y) {
      const retDict = {};
      const habitDict = {
        "A": [8.5, 12.5],
        "F": [1.5, 2.2],
        "G": [0.95, 1.4],
        "K": [0.38, 0.56],
        "M": [0.08, 0.12],
      }
      const retArray = [{"x": 'Habitable', "y": 0}, {"x": "Inhabitable", "y": 0}];
    
      data.forEach(row => {
        if(row[Y].charAt(0) == row[Y].charAt(0).toUpperCase()) {
          if(!(row[Y].charAt(0) in retDict)) {
            retDict[row[Y].charAt(0)] = [row['pl_orbsmax']];
          }
          else {
            retDict[row[Y].charAt(0)].push(row['pl_orbsmax']);
          }
        }
      })
    
      for (const [key, value] of Object.entries(retDict)) {
        if (['A', 'F', 'G', 'K', 'M'].includes(key)) {
          value.forEach(item => {
            if (item > habitDict[key][0] && item < habitDict[key][1]) {
              retArray[0]['y'] += 1;
            }
            else {
              retArray[1]['y'] += 1;
            }
          });
        }
          }
    
        return retArray;
    }
    
    getDistDistrib(data, Y, category, f) {
      const retArray = []

      if (f != undefined) {
        if (category == 'st_spectype' && f.length == 1) {
          data.forEach(row => {
            if(row[category].charAt(0) == f) {
              retArray.push({
                "distance": row[Y]
              });
            }
          });
        }

        else if (category == 'st_spectype') {
          const habitDict = {
            "A": [8.5, 12.5],
            "F": [1.5, 2.2],
            "G": [0.95, 1.4],
            "K": [0.38, 0.56],
            "M": [0.08, 0.12],
          }
          data.forEach(row => {
              if(row[category].charAt(0) in habitDict) {
                if (f == 'Habitable' && (row['pl_orbsmax'] > habitDict[row[category].charAt(0)][0] && row['pl_orbsmax'] < habitDict[row[category].charAt(0)][1])) {
                  retArray.push({
                    "distance": row[Y]
                  });
                }
                else if (f == 'Inhabitable' && (row['pl_orbsmax'] < habitDict[row[category].charAt(0)][0] || row['pl_orbsmax'] > habitDict[row[category].charAt(0)][1])) {
                  retArray.push({
                    "distance": row[Y]
                  });
                }
              }
            });
        }

        else {
          data.forEach(row => {
            if(row[category] == f) {
              retArray.push({
                "distance": row[Y]
              });
            }
          });
        }
      }
    
      else {
        data.forEach(row => {
          retArray.push({
            "distance": row[Y]
          });
        });
      }
      return retArray;
    }
    
    getRadiusVsMass(data, category, f) {
      const retArray = [];
      if (f != undefined) {
        if (category == 'st_spectype' && f.length == 1) {
          data.forEach(row => {
            if (row['pl_rade'] != "" && row['bmasse'] != "") {
              const dict = {};
              if(row[category].charAt(0) != f) {
                dict['f'] = true;
              }
              dict['radius'] = row['pl_rade'];
              dict['mass'] = row['pl_bmasse'];
              dict['exo'] = true;
              retArray.push(dict);
            }
          });
        }

        else if (category == 'st_spectype') {
          const habitDict = {
            "A": [8.5, 12.5],
            "F": [1.5, 2.2],
            "G": [0.95, 1.4],
            "K": [0.38, 0.56],
            "M": [0.08, 0.12],
          }
          data.forEach(row => {
            if (row['pl_rade'] != "" && row['bmasse'] != "") {
              const dict = {};
              if(row[category].charAt(0) in habitDict) {
                if (f != 'Habitable' && (row['pl_orbsmax'] > habitDict[row[category].charAt(0)][0] && row['pl_orbsmax'] < habitDict[row[category].charAt(0)][1])) {
                  dict['f'] = true;
                }
                else if (f != 'Inhabitable' && (row['pl_orbsmax'] < habitDict[row[category].charAt(0)][0] || row['pl_orbsmax'] > habitDict[row[category].charAt(0)][1])) {
                  dict['f'] = true;
                }
                dict['radius'] = row['pl_rade'];
                dict['mass'] = row['pl_bmasse'];
                dict['exo'] = true;
                retArray.push(dict);
              }
            }
          });
        }

        else {
          data.forEach(row => {
            if (row['pl_rade'] != "" && row['bmasse'] != "") {
              const dict = {};
              if(row[category] != f) {
                dict['f'] = true;
              }
              dict['radius'] = row['pl_rade'];
              dict['mass'] = row['pl_bmasse'];
              dict['exo'] = true;
              retArray.push(dict);
            }
          });
        }
      }
      else {
        data.forEach(row => {
          if (row['pl_rade'] != "" && row['bmasse'] != "") {
            const dict = {};
            dict['radius'] = row['pl_rade'];
            dict['mass'] = row['pl_bmasse'];
            dict['exo'] = true;
            retArray.push(dict);
            }
        });
      }
    
      retArray.push({radius: 1, mass: 1}); //Earth
      retArray.push({radius: 0.38, mass: .11, exo: false}); //Mars
      retArray.push({radius: 3.864, mass: 17.15, exo: false}); //Neptune
      retArray.push({radius: 11.2, mass: 317.8, exo: false}); //Jupiter
      retArray.push({radius: 0.38, mass: 0.055, exo: false}); //Mercury
      retArray.push({radius: 3.9807, mass: 14.536, exo: false}); //Uranus
      retArray.push({radius: 9.13, mass: 95.16, exo: false}); //Saturn 
      retArray.push({radius: 0.95, mass: .08, exo: false}); //Venus 
    
      return retArray;
    }
  }
