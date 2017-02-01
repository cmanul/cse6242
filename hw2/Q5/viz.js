// have to pollute global namespace due to sankey.js:130

var margin = {top: 20, right: 90, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

(function () {
  var self = this;

  self.graph = {};

  self.process_graph = function (races, teams) {
    var nodes = [];
    var name2id = d3.map();

    function nodeId(name, point) {
      if (name2id.has(name)) {
        var id = name2id.get(name);
        nodes[id].points += point;
        return id;
      }
      name2id.set(name, nodes.length);
      nodes.push({name: name, points: point});
      return nodes.length - 1;
    };

    var raceDriverLinks = races.map(function (r) {
      var srcId = nodeId(r.race, +r.points);
      var tgtId = nodeId(r.driver, +r.points);

      return {
        source: srcId,
        target: tgtId,
        value: +r.points,
        tooltip: r.race + " - " + r.driver + " - " + r.points + " points"
      };
    });

    var driverTeamLinks = teams.map(function (team) {
      var srcId = nodeId(team.driver, 0),
          tgtId = nodeId(team.team, +team.points);

      return {
        source: srcId,
        target: tgtId,
        value: +team.points,
        tooltip: team.driver + " - " + team.team + " - " + team.points + " points"
      };
    });

    nodes.forEach(function (node) {
      node.tooltip = node.name + " - " + node.points + " points";
    });

    graph.nodes = nodes;
    graph.links = raceDriverLinks.concat(driverTeamLinks);
  };


  var svg = d3.select(".main").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([10, 0])
    .html(function(d) { 
    return "<strong>" + d.tooltip + "</strong>";
  });
  svg.call(tip);

  var color = d3.scale.category20();

  var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(5)
    .size([width, height]);

  var path = sankey.link();

  self.draw = function () {
    sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(32);

    // add in the links
    var link = svg.append("g").selectAll(".link")
      .data(graph.links)
      .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

    // // add the link titles
    // link.append("title")
    //   .text(function(d) {return d.tooltip;});

    // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { 
          return "translate(" + d.x + "," + d.y + ")"; })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .call(d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("dragstart", function() { 
          this.parentNode.appendChild(this); })
        .on("drag", function (d) {
          d3.select(this).attr("transform", 
              "translate(" + d.x + "," + (
                      d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
                  ) + ")");
          sankey.relayout();
          link.attr("d", path);
        }));

    // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { 
          return d.color = color(d.name.replace(/\W/gi, "")); })
        .style("stroke", function(d) { 
          return d3.rgb(d.color).darker(2); });
      // .append("title")
      //   .text(function(d) { return d.name; });

    // add in the title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
      .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");
  };

  // load data and plot
  d3.csv("races.csv", function (err, races) {
    if (err) throw err;
    d3.csv("teams.csv", function (err, teams) {
      self.process_graph(races, teams);
      self.draw();
    });
  }); 
})();