(function () {
    var self = this;

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var color = d3.scale.category10();

    self.symbol = {
      "setosa" : d3.svg.symbol().type("circle"),
      "versicolor": d3.svg.symbol().type("square"),
      "virginica": d3.svg.symbol().type("triangle-up")
    }

    self.scatter = function (xname, yname, xlabel, ylabel, title) {
        var id = title.toLowerCase().replace(/\W+/g, "");
        var div = d3.select(".main")
          .append("div")
            .attr("id", id);
        // add header
        div.append("h2").text(title);

        var svg = div.append("svg:svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var x = d3.scale.sqrt()
            .range([0, width])
            .domain(d3.extent(self.data, function(d) { return d[xname]; })).nice();

        var y = d3.scale.sqrt()
            .range([height, 0])
            .domain(d3.extent(self.data, function(d) { return d[yname]; })).nice();

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text(xlabel);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(ylabel);

        // var scale = d3.scale.linear()
        //     .range([20, 50])
        //     .domain(d3.extent(self.data, function(d) { return d[xname]*d[xname]; }))
        //     .nice();

        svg.selectAll(".dot")
            .data(self.data)
          .enter()
          .append("path")
            .attr("class", "dot")
            .attr("d", function (d) {
              return self.symbol[d.species]();//.size(scale(d[xname]*d[xname]))();
            })
            .attr("transform", function(d) { return "translate(" + x(d[xname]) + "," + y(d[yname]) + ")"; })
            .style("fill", function(d) { return color(d.species); });

        var legend = svg.selectAll(".legend")
            .data(color.domain())
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("path")
            .attr("d", function (d) {
              return self.symbol[d]();
            })
            .attr("transform", "translate(" + (width - 18)  +", 0)")
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 26)
            .attr("y", 0)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });
    };

    d3.tsv("iris.tsv", function (err, data) {
        if (err) throw err;
        self.data = data.map(function (d) {
            // coerce
            return {
                petalLength: +d.petalLength,
                petalWidth: +d.petalWidth,
                sepalLength: +d.sepalLength,
                sepalWidth: +d.sepalWidth,
                species: d.species
            }
        });
                /*petalLength: "1.4"petalWidth: "0.2"sepalLength: "5.1"sepalWidth: "3.5"species: "setosa"*/
        self.scatter("petalLength", "petalWidth", "Petal Length (cm)", "Petal Width (cm)", "Petal Length V.S. Petal Width");
        self.scatter("sepalLength", "sepalWidth", "Sepal Length (cm)", "Sepal Width (cm)", "Sepal Length V.S. Sepal Width");

    });
}());