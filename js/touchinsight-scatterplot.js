function Scatter(options) {

    var _self = this;

    _self.parentId = options.parentId;

    _self.cols = options.cols;

    _self.margin = {
        top: 5,
        right: 30,
        bottom: 30,
        left: 50
    };

    _self.width = options.width - _self.margin.left - _self.margin.right;

    _self.height = options.height - _self.margin.top - _self.margin.bottom;

    _self.optionsWidth = options.width;

    _self.optionsHeight = options.height;

    _self.myFormat = d3.format(',');

    _self.defaultData = null;
}


Scatter.prototype.redraw = function (data) {

    var _self = this;

    // var data = processData(_self.rawData, _self.cols[0], _self.cols[1]);

    _self.margin = {
        top: crimeMargins[_self.cols[1]],
        right: 5,
        bottom: 5,
        left: crimeMargins[_self.cols[0]]
    };

    _self.width = _self.optionsWidth - _self.margin.left - _self.margin.right;

    _self.height = _self.optionsHeight - _self.margin.top - _self.margin.bottom;

    if (d3.select("#" + _self.parentId + "scatter").empty()) {

        d3.select("#" + _self.parentId).selectAll("#" + _self.parentId + "div").remove();

        for (var i = 0; i < 2; i++) {

            var d = _self.cols[i];

            if (i == 0) {

                _self.y = d3.scale.ordinal()
                    .domain(data.map(function (p) {
                        return p["key"][d];
                    }).sort())
                    .rangePoints([_self.height, 0]);


            } else {


                if (isNumeric[d]) {

                    _self.x = d3.scale.linear()
                        .domain(d3.extent(data, function (p) {
                            return p["key"][d];
                        }))
                        .range([0, _self.width]);


                } else if (d.toLowerCase().indexOf("date") > 0) {

                    _self.x = d3.time.scale()
                        .domain(d3.extent(data, function (p) {
                            return new Date(p["key"][d]);
                        }))
                        .range([0, _self.width]);

                } else if (d.toLowerCase().indexOf("time") > 0) {

                    _self.x = d3.time.scale()
                        .domain(d3.extent(data, function (p) {
                            return _self.parseTime(p["key"][d]);
                        }))
                        .range([0, _self.width]);


                } else {

                    _self.x = d3.scale.ordinal()
                        .domain(data.map(function (p) {
                            return p["key"][d];
                        }).sort())
                        .rangePoints([0, _self.width]);
                }
            }
        }

        _self.color = d3.scale.category10();

        if (_self.y.domain().length * 10 > _self.actualheight) {

            _self.height = _self.y.domain().length * 10 + _self.margin.top + _self.margin.bottom;

        }

        _self.svg = d3.select("#" + _self.parentId).append("div")
            .style("overflow", "scroll")
            .attr("id", _self.parentId + "div")
            .style("width", _self.width + _self.margin.left + _self.margin.right)
            .style("height", _self.actualheight + _self.margin.top + _self.margin.bottom)
            .append("svg")
            .attr("id", _self.parentId + "scatter")
            .attr("width", _self.width + _self.margin.left + _self.margin.right)
            .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + _self.margin.left + "," +
                _self.margin.top + ")");

        _self.y.rangePoints([_self.height, 0]);

        _self.xAxis = d3.svg.axis()
            .scale(_self.x)
            .orient("top");

        _self.yAxis = d3.svg.axis()
            .scale(_self.y)
            .orient("left");

        var FONTWIDTH = 10;

        if (_self.x.domain().length > _self.width / FONTWIDTH) {

            var skip = Math.round(1 / (_self.width / (FONTWIDTH * _self.x.domain().length)));

            _self.xAxis.tickValues(_self.x.domain()
                .filter(function (d, i) {
                    return !(i % skip);
                }));

        }

        if (_self.y.domain().length > _self.height / FONTWIDTH) {

            var skip = Math.round(1 / (_self.height / (FONTWIDTH * _self.y.domain().length)));

            _self.yAxis.tickValues(_self.y.domain()
                .filter(function (d, i) {
                    return !(i % skip);
                }));

        }

        _self.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0,0)")
            .call(_self.xAxis);

        _self.svg.append("g")
            .attr("class", "y axis")
            .call(_self.yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("x", -6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style("font-size", "14px")
            .text(_self.cols[0]);

        _self.svg.select(".x.axis")
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "start");

        _self.svg.select(".x.axis")
            .append("text")
            .attr("class", "label")
            .attr("x", _self.width)
            .attr("y", 15)
            .style("text-anchor", "end")
            .style("font-size", "14px")
            .text(_self.cols[1]);

        _self.radius = d3.scale.linear()
            .domain(d3.extent(data, function (p) {
                return p["value"];
            }))
            .range([2, 10]);

        var dots = _self.svg.selectAll(".dot")
            .data(data);

        dots.enter().append("circle")
            .attr("class", "dot")
            .attr("r", function (d) {
                return _self.radius(d["value"]);
            })
            .attr("cx", function (d) {
                if (_self.cols[1].toLowerCase().indexOf("date") > 0) {
                    return _self.x(new Date(d["key"][_self.cols[1]]));
                }

                if (_self.cols[1].toLowerCase().indexOf("time") > 0) {
                    return _self.x(_self.parseTime(d["key"][_self.cols[1]]));
                }
                return _self.x(d["key"][_self.cols[1]]);
            })
            .attr("cy", function (d) {
                if (_self.cols[0].toLowerCase().indexOf("date") > 0) {
                    return _self.y(new Date(d["key"][_self.cols[0]]));
                }

                if (_self.cols[0].toLowerCase().indexOf("time") > 0) {
                    return _self.y(_self.parseTime(d["key"][_self.cols[0]]));
                }
                return _self.y(d["key"][_self.cols[0]]);
            })
            .style("fill", function (d) {
                return "#4292c6";
            })
            .style("fill-opacity", function (d) {
                return 0.3;
            });

    } else {

        _self.radius = d3.scale.linear()
            .domain(d3.extent(data, function (p) {
                return p["value"];
            }))
            .range([2, 10]);

        var dots = _self.svg.selectAll(".dot")
            .data(data);

        dots.exit().remove();

        dots.enter().append("circle")
            .attr("class", "dot")
            .attr("r", function (d) {
                return _self.radius(d["value"]);
            })
            .attr("cx", function (d) {
                if (_self.cols[1].toLowerCase().indexOf("date") > 0) {
                    return _self.x(new Date(d["key"][_self.cols[1]]));
                }

                if (_self.cols[1].toLowerCase().indexOf("time") > 0) {
                    return _self.x(_self.parseTime(d["key"][_self.cols[1]]));
                }
                return _self.x(d["key"][_self.cols[1]]);
            })
            .attr("cy", function (d) {
                if (_self.cols[0].toLowerCase().indexOf("date") > 0) {
                    return _self.y(new Date(d["key"][_self.cols[0]]));
                }

                if (_self.cols[0].toLowerCase().indexOf("time") > 0) {
                    return _self.y(_self.parseTime(d["key"][_self.cols[0]]));
                }
                return _self.y(d["key"][_self.cols[0]]);
            })
            .style("fill", function (d) {
                return "#4292c6";
            })
            .style("fill-opacity", function (d) {
                return 0.3;
            });

        dots.attr("r", function (d) {
                return _self.radius(d["value"]);
            })
            .attr("cx", function (d) {
                if (_self.cols[1].toLowerCase().indexOf("date") > 0) {
                    return _self.x(new Date(d["key"][_self.cols[1]]));
                }

                if (_self.cols[1].toLowerCase().indexOf("time") > 0) {
                    return _self.x(_self.parseTime(d["key"][_self.cols[1]]));
                }
                return _self.x(d["key"][_self.cols[1]]);
            })
            .attr("cy", function (d) {
                if (_self.cols[0].toLowerCase().indexOf("date") > 0) {
                    return _self.y(new Date(d["key"][_self.cols[0]]));
                }

                if (_self.cols[0].toLowerCase().indexOf("time") > 0) {
                    return _self.y(_self.parseTime(d["key"][_self.cols[0]]));
                }
                return _self.y(d["key"][_self.cols[0]]);
            })
            .style("fill", function (d) {
                return "#4292c6";
            })
            .style("fill-opacity", function (d) {
                return 0.3;
            });

    }

}