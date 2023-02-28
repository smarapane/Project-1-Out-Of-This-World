console.log("Hello world");

d3.csv('data/exoplanets-1.csv')
  .then(_data => {
  	console.log('Data loading complete. Work with dataset.');
  	data = _data;

    data.forEach(d => {
      	//d.daysFromYrStart = computeDays(d.start); 
		// convert the string columns 
		d.disc_year = +d.disc_year;
		d.pl_bmasse = +d.pl_bmasse;
		d.pl_orbeccen = +d.pl_orbeccen;
		d.pl_orbsmax = +d.pl_orbsmax;
		d.pl_rade = +d.pl_rade;
		d.st_mass = +d.st_mass;
		d.st_rad = +d.st_rad;
		d.sy_dist = +d.sy_dist;
		d.sy_pnum = +d.sy_pnum;
		d.sy_snum = +d.sy_snum;
	});

	barGraph = new BarGraph({ parentElement: '#bargraph'}, _data);

})

.catch(error => {
    console.error('Error loading the data', error);
});

d3.selectAll('.bargraph-btn').on('click', function() {
	d3.selectAll('.bargraph-btn:not(.inactive)').each(function() {
	  d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));
	});
  
	d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));
	
	let active = ""
	d3.selectAll('.bargraph-btn:not(.inactive)').each(function() {
	  active = d3.select(this).attr('category');
	})
	refreshBarGraph(active);	
	});

function refreshBarGraph(category) {
	if (category == "stars") {
		barGraph.updateVis(0, "Number of Stars", "Number of Exoplanets", "star", "Number of Exoplanets in 'x' Star Systems", "", 'sy_snum');
		barGraph.filter();
	}
	if (category == "planets") {
		barGraph.updateVis(0, "Number of Planets in System", "Number of Exoplanets", "planet", "Number of Planets in 'x' Planet Systems", "", 'sy_pnum');
		barGraph.filter();
	}
	if (category == "startypes") {
		barGraph.updateVis(0, "Star Types", "Number of Exoplanets", "", "Number of Planets Orbiting The Star Types", "https://nineplanets.org/questions/what-is-o-b-a-f-g-k-m/", "st_spectype");
		barGraph.filter();
	}
	if (category == "discoverymethods") {
		barGraph.updateVis(70, "Discovery Methods", "Number of Exoplanets", "", "Number of Planets Per Discovery Method", "https://en.wikipedia.org/wiki/Methods_of_detecting_exoplanets", 'discoverymethod');
		barGraph.filter();
	}
	if (category == "habitable") {
		barGraph.updateVis(0, "Habitability", "Number of Exoplanets", "", "Number of Habitable Planets", "", "st_spectype");
		barGraph.filter();
	}
}
  