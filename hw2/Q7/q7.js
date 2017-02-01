(function() {
  var self = this;

  self.setupData = function (data) {
    self.statesJson = data.usgeo;
    self.facts = crossfilter(data.universities);
    self.dimension = {
      name: self.facts.dimension(function (d) {return d.INSTNM;}),
      state: self.facts.dimension(function (d) {return d.STABBR;}),
      sat: self.facts.dimension(function (d) {return d.SAT_AVG;}),
      enrollment: self.facts.dimension(function (d) {return d.UGDS;}),
      earn: self.facts.dimension(function (d) {return +d.md_earn_wne_p10?+d.md_earn_wne_p10:0;}),
      control: self.facts.dimension(function (d) {return ["Public", "Private nonprofit", "Private for-profit"][d.CONTROL-1];}),
      price: self.facts.dimension(function (d) {return d.NPT4})
    };
   self.group = {stateGrp: self.dimension.state.group(),
      satBinGrp: self.dimension.sat.group(function (sat) {return 5 * Math.floor(sat/5);}),
      enrollmentBinGrp: self.dimension.enrollment.group(function (enrollment) { return 200 * Math.floor(enrollment/200); }),
      earnBinGrp: self.dimension.earn.group(function (earn) {return 1000 * Math.floor(earn / 1000);}),
      controlGrp: self.dimension.control.group(),
      priceBinGrp: self.dimension.price.group(function (price) {return 1000 * Math.floor(price / 1000);}),
      all: self.facts.groupAll()
    };
  };

  self.createGeoChart = function () {
    self.geoChart = dc.geoChoroplethChart("#dc-school-geo");
    self.geoChart
      .width(860)
      .height(500)
      .dimension(self.dimension.state)
      .group(self.group.stateGrp)
      .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
      .colorDomain([0, 200])
      .colorCalculator(function (d) {return d ? self.geoChart.colors()(d): '#ccc';})
      .overlayGeoJson(self.statesJson.features, "state", function (d) {
        return d.properties.name;
      })
      .title(function (d) {
        return "State: " + d.key + "\n" + (d.value ? d.value : 0) + " Universities"
      });
  };

  self.createTypeChart = function () {
    self.typeChart = dc.rowChart("#dc-school-type");
    self.typeChart
      .width(240)
      .height(500)
      .margins({top: 80, left: 10, right: 10, bottom: 160})
      .dimension(self.dimension.control)
      .group(self.group.controlGrp)
      .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
      .label(function (d) {
          return d.key;
      })
      .title(function (d) {
            return d.key + ": " + d.value;
      })
      .elasticX(true);
  };

  self.createSatChart = function () {
    self.satChart = dc.barChart("#dc-avg-sat");
    self.satChart
      .width(480)
      .height(250)
      .dimension(self.dimension.sat)
      .group(self.group.satBinGrp)
      .margins({top: 10, right: 10, bottom: 20, left: 20})
      .centerBar(true)
      .x(d3.scale.linear().domain([600, 2000]))
      .xUnits(dc.units.fp.precision(5))
      .elasticY(true)
      .elasticX(true);
  };

  self.createEnrollmentChart = function () {
    self.enrollmentChart = dc.barChart("#dc-enrollment");
    self.enrollmentChart
      .width(480)
      .height(250)
      .margins({top: 10, right: 10, bottom: 20, left: 20})
      .dimension(self.dimension.enrollment)
      .group(self.group.enrollmentBinGrp)
      .centerBar(true)
      .x(d3.scale.linear().domain([1000, 50000]))
      .xUnits(dc.units.fp.precision(200))
      .elasticX(true)
      .elasticY(true)
      .xAxis()
      .ticks(5);
  };

  self.createCostChart = function () {
    self.costChart = dc.barChart("#dc-cost");
    self.costChart
      .width(480)
      .height(250)
      .margins({top: 10, right: 10, bottom: 20, left: 20})
      .dimension(self.dimension.price)
      .group(self.group.priceBinGrp)
      .xUnits(dc.units.fp.precision(1000))
      .centerBar(true)
      .round(dc.round.floor)
      .alwaysUseRounding(true)
      .x(d3.scale.linear().domain([1000, 45000]))
      .elasticY(true)
      .xAxis()
      .tickFormat(function (v) { return (v / 1000) + "k"; });
  };

  self.createEarnChart = function () {
    self.earnChart = dc.barChart("#dc-earn");
    self.earnChart
      .width(480)
      .height(250)
      .margins({top: 10, right: 10, bottom: 20, left: 20})
      .dimension(self.dimension.earn)
      .group(self.group.earnBinGrp)
      .centerBar(true)
      .x(d3.scale.linear().domain([10000, 120000]))
      .xUnits(dc.units.fp.precision(1000))
      .elasticY(true)
      .xAxis()
      .tickFormat(function (v) { return (v / 1000) + "k"; });
  };

  var currencyFormat = d3.format(" >$,"),
      numFormat = d3.format(">,");

  self.createTable = function () {
    self.selectedCount = dc.dataCount(".dc-data-count");
    self.selectedCount
      .dimension(self.facts)
      .group(self.group.all)
      .html({
            some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
            all: 'All records selected. Please click on the graph to apply filters.'
        });
    self.dataTable = dc.dataTable("#dc-school-table");
    self.dataTable
      .width(960)
      .height(800)
      .dimension(self.dimension.name)
    .group(function (d) { return "List of all universities corresponding to the filters. Double click for more details."; })
      .size(20)
      .columns([
        function (d) {return '<a target="_blank" href="http://' + d.INSTURL.replace(/https*:\/\//i, "") + '">' +  d.INSTNM; + '</a>';},
        function (d) {return d.CITY + ", " + d.STABBR;},
        function (d) {return numFormat(d.SAT_AVG); },
        function (d) {return numFormat(d.UGDS); },
        function (d) {return currencyFormat(d.md_earn_wne_p10); }
      ])
      .sortBy(function(d) {return d.INSTNM;})
      .order(d3.ascending)
      .on('renderlet', function (table) {
            table.selectAll('.dc-table-group').classed('info', true);
            table.select('tbody')
              .selectAll('tr')
              .on('dblclick', self.onTableRowDblClick)
        });
  };

  var percentFormat = d3.format(".3p")

  var pieTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .direction('e')
    .html(function (d) { 
      return "<span style='color: #f0027f'>" +  d.data.key + "</span> : "  + percentFormat(d.data.value); 
    });

  self.addTooptip = function (chart) {
    chart.selectAll(".pie-slice").call(pieTip);
    chart.selectAll(".pie-slice")
      .on('mouseover', pieTip.show)
      .on('mouseout', pieTip.hide);
  };

  $("#detailModal").modal({backdrop: 'static', show: false});
  self.onTableRowDblClick = function (d) {
    if (!d.INSTNM) return;
    console.log("double clicked " + d.INSTNM);

    if ($("#detailModalTitle").text() != d.INSTNM) {
      $("#detailModalTitle").text(d.INSTNM);
      $("#dc-detail-pie").html();
      var parsed = self.parseDemoAndDegree(d);
      var instDemos = parsed.demos;
      var nameDimension = instDemos.dimension(function (d) {return d.name});
      var valueGrp = nameDimension.group().reduceSum(function (d) {return d.value;});
      var pieDemo = dc.pieChart("#dc-detail-demo-pie", "detail")
        .width(240)
        .height(240)
        .innerRadius(40)
        .radius(100)
        .dimension(nameDimension)
        .group(valueGrp)
        // .title(function (d) {return d.key + ': ' + percentFormat(d.value);})
        .renderTitle(false)
        .renderLabel(false)
        .on("renderlet", self.addTooptip);
      pieDemo.filter = function() {};
      pieDemo.render();

      var instDegrees = parsed.degrees;
      var nameDimension = instDegrees.dimension(function (d) {return d.name});
      var valueGrp = nameDimension.group().reduceSum(function (d) {return d.value;});
      var pieDegree = dc.pieChart("#dc-detail-degree-pie", "detail")
        .width(240)
        .height(240)
        .radius(100)
        .dimension(nameDimension)
        .group(valueGrp)
        .slicesCap(6)
        .renderTitle(false)
        .renderLabel(false)
        .on("renderlet", self.addTooptip);

      pieDegree.filter = function() {};
      pieDegree.render();
    }
    $("#detailModal").modal('show');
  };

  // parse demo and degree;
  self.raceName = {"UGDS_BLACK":    "black"    ,
    "UGDS_HISP":     "Hispanic" ,
    "UGDS_ASIAN":    "Asian"    ,
    "UGDS_AIAN":     "American Indian/Alaska Native"    ,
    "UGDS_NHPI":     "Native Hawaiian/Pacific Islander" ,
    "UGDS_2MOR":     "two or more races"    ,
    "UGDS_NRA":  "non-resident aliens"  ,
    "UGDS_UNKN":     "unknown"    ,
    "UGDS_WHITENH":  "white non-Hispanic"   ,
    "UGDS_BLACKNH":  "black non-Hispanic"   ,
    "UGDS_API":  "Asian/Pacific Islander"   ,
    "UGDS_AIANOLD":  "American Indian/Alaska Native"    ,
    "UGDS_HISPOLD":  "Hispanic"};
  self.degreeName = ["Agriculture", "Natural Resources and Conservation", "Architecture", "Area, Ethnic, Cultural, Gender, and Group Studies", "Communication, Journalism, and Related Programs", "Communications Technologies/Technicians and Support Services", "Computer and Information Sciences and Support Services", "Personal and Culinary Services", "Education", "Engineering", "Engineering Technologies and Engineering-Related Fields", "Foreign Languages, Literatures, and Linguistics", "Family and Consumer Sciences/Human Sciences", "Legal Professions and Studies", "English Language and Literature/Letters", "Liberal Arts and Sciences, General Studies and Humanities", "Library Science", "Biological and Biomedical Sciences", "Mathematics and Statistics", "Military Technologies and Applied Sciences", "Multi/Interdisciplinary Studies", "Parks, Recreation, Leisure, and Fitness Studies", "Philosophy and Religious Studies", "Theology and Religious Vocations", "Physical Sciences", "Science Technologies/Technicians", "Psychology", "Homeland Security, Law Enforcement, Firefighting and Related Protective Services", "Public Administration and Social Service Professions", "Social Sciences", "Construction Trades", "Mechanic and Repair Technologies/Technicians", "Precision Production", "Transportation and Materials Moving", "Visual and Performing Arts", "Health Professions and Related Programs", "Business, Management, Marketing, and Related Support Services", "History"];
  self.parseDemoAndDegree = function (datum) {
    var demos = []
    for (var key in self.raceName) {
      if (datum[key] > 0.001) {
        demos.push({name: self.raceName[key], value: datum[key]});
      }
    }

    var degrees = []
    for (var i = 1; i <= self.degreeName.length; i++) {
      var key = i < 10? "PCIP0" + i: "PCIP" + i;
      if (datum[key] > 0.0) {
        degrees.push({name: self.degreeName[i-1], value: datum[key]});
      }
    }
    return {
      demos: crossfilter(demos),
      degrees: crossfilter(degrees)
    }
  };

  d3.json("data.json", function (err, data) {
    if (err) throw err;

    self.setupData(data);
    self.createTable();
    self.createGeoChart();
    self.createTypeChart();
    self.createSatChart();
    self.createEnrollmentChart();
    self.createCostChart();
    self.createEarnChart();

    dc.renderAll();
  });
})();