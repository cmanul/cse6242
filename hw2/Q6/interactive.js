(function (dataset) {
    var self = this;

    var overallQuarter = [0, 0, 0, 0];
    var overallTotal = 0;
    self.itemized = dataset.map(function (datum) {
      var total = datum.freq.Q1 + datum.freq.Q2 + datum.freq.Q3 + datum.freq.Q4;
      var percentage = [datum.freq.Q1/total, datum.freq.Q2/total, datum.freq.Q3/total, datum.freq.Q4/total];
      var revenue = [datum.freq.Q1, datum.freq.Q2, datum.freq.Q3, datum.freq.Q4];

      for (var i = 0; i < 4; i++) {
        overallQuarter[i] += revenue[i];
      }
      overallTotal += total;

      return {
        name: datum.product,
        revenue: d3.zip(["Q1", "Q2", "Q3", "Q4"], revenue, percentage),
        total: total
      }
    });
    var overallPercentage = overallQuarter.map(function (p) {return p/overallTotal;});
    self.overall = d3.zip(["Q1", "Q2", "Q3", "Q4"], overallQuarter, overallPercentage);

    var margin = {top: 20, right: 230, bottom: 30, left: 100},
        width = 960 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var currencyFormat = d3.format(" >$10,"),
        percentFormat = d3.format(">6.2p");

    var svg = d3.select(".main").append("svg:svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.sqrt()
        .range([0, width])
        .domain([0, d3.max(self.itemized, function(d) { return d.total; })]).nice();

    var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], 0.1)
        .domain(self.itemized.map(function (d) {return d.name;}));

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        // .tickSize([6, 0])
        .tickPadding(6);

    var bar = svg.selectAll(".bar")
        .data(self.itemized)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(0," + y(d.name) + ")"; });

    // show the bar
    bar.append("rect")
        .attr("width", function (d) { return x(d.total); })
        .attr("height", y.rangeBand())
        .on("mouseover", function (d) {
          self.showLegend(d.revenue);
        })
        .on("mouseout", function () {
          self.showLegend(self.overall);
        });

    // show the label
    bar.append("text")
        .attr("x", function(d) { return x(d.total) - 3; })
        .attr("y", y.rangeBand() / 2)
        .attr("dy", ".35em")
        .text(function(d) { return currencyFormat(d.total); });

    // show the axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // show the legend
    var legend = svg.append("g")
        .attr("transform", "translate(" + (width + 20) + ", " + (height - 100) + ")")
        .attr("class", ".legend");

    self.showLegend = function(data) {
      var items = legend.selectAll("text").data(data, function (d) { return d[0]; });

      items.exit().remove();
      items.style("fill-opacity", 1e-6)
          .attr("y", function (d, i) { return i * 30 - 60;})
          .text(function (d) {
            return d[0] + currencyFormat(d[1]) + percentFormat(d[2]);//).replace(/\s/g, "\u00A0");
          })
        .transition()
          .attr("y",function (d, i) { return i * 30;})
          .style("fill-opacity", 1);
      items.enter().append("text")
          .attr("y", function (d, i) { return i * 30;})
          .attr("x", 0)
          .attr("xml:space", "preserve")
          .text(function (d) {
            return d[0] + currencyFormat(d[1]) + percentFormat(d[2]);//).replace(/\s/g, "\u00A0");
          });
    };

    self.showLegend(self.overall);

})(data);