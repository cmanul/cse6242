(function () {
  var self = this;

  var margin = {top: 20, right: 90, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.scale.ordinal().rangeRoundPoints([0, width]).domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]),
      y = d3.scale.linear().range([height, 0]),
      z = d3.scale.linear().range(['white', 'red']);

  // The size of the buckets in the CSV data file.
  // This could be inferred from the data if it weren't sparse.
  var xStep = 864e5,
      yStep = 10;

  var svg = d3.select(".main").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  self.flatten = function (data) {
    var res = [];
    for (var i = data.length - 1; i >= 0; i--) {
      for (var j = 0; j < 24; j++) {
        res.push({
          x : j,
          y : data[i]["key"],
          z : data[i]["values"][j]
        });
      }
    }
    return res;
  }

  d3.json("hourly_heatmap.json", function (err, data) {
    if (err) throw err;
    // console.log(data);

    var buckets = self.flatten(data);
    // Compute the scale domains.
    y.domain(d3.extent(buckets, function(d) { return d.y; }));
    z.domain([0, d3.max(buckets, function(d) { return d.z; })]);

    // Extend the y-domain to fit the last bucket.
    y.domain([y.domain()[0], y.domain()[1] + yStep]);

    // Display the tiles for each non-zero bucket.
    // See http://bl.ocks.org/3074470 for an alternative implementation.
    svg.selectAll(".tile")
        .data(buckets)
      .enter().append("rect")
        .attr("class", "tile")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y + yStep); })
        .attr("width", x(1) - x(0))
        .attr("height",  y(0) - y(yStep))
        .style("fill", function(d) { return z(d.z); });

    // Add a legend for the color values.
    var legend = svg.selectAll(".legend")
        .data(z.ticks(6).slice(1).reverse())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(" + (width + 20) + "," + (20 + i * 20) + ")"; });

    legend.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", z);

    legend.append("text")
        .attr("x", 26)
        .attr("y", 10)
        .attr("dy", ".35em")
        .text(String);

    svg.append("text")
        .attr("class", "label")
        .attr("x", width + 20)
        .attr("y", 10)
        .attr("dy", ".35em")
        .text("Count");

    // Add an x-axis with label.
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height + 10) + ")")
        .call(d3.svg.axis().scale(x).orient("bottom"))
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .attr("text-anchor", "end")
        .text("Hour");

    // Add a y-axis with label.
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(-10, 0)")
        .call(d3.svg.axis().scale(y).orient("left"))
      .append("text")
        .attr("class", "label")
        .attr("y", 6)
        .attr("dy", ".71em")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .text("Value");
  });
})();