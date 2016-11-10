/*
 Input is an object containing parentId, cols, width, height
 Call function @redraw with the actual data as argument
 */

function LineChart(options) {

    var _self = this;

    _self.margin = {
        top: 10,
        right: 10,
        bottom: 50,
        left: 45
    };

    _self.parentId = options.parentId;

    _self.cols = options.cols;

    _self.width = options.width - _self.margin.left - _self.margin.right;

    _self.height = options.height - _self.margin.top - _self.margin.bottom;

    // _self.hasMonth = options.month;
    _self.parseDate = d3.time.format("%b/%d/%y").parse;

}

LineChart.prototype.redraw = function (data) {

    var _self = this;

    _self.targetData = data;

    if (d3.select("#" + _self.parentId + "line").empty()) {

        _self.svg = d3.select("#" + _self.parentId)
            .append("svg")
            .attr("id", _self.parentId + "line")
            .attr("width", _self.width + _self.margin.left + _self.margin.right)
            .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (_self.margin.left) + "," +
                _self.margin.top + ")");

        var x = _self.x = d3.time.scale().range([0, _self.width]);

        var y = _self.y = d3.scale.linear().range([_self.height, 0]);

        var xAxis = _self.xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(function (d) {
                return d3.time.format('%Y')(new Date(d));
            })
            .innerTickSize(-_self.height)
            .outerTickSize(0)
            .tickPadding(10);

        _self.xAxis.ticks(d3.time.year, 1);

        var yAxis = _self.yAxis = d3.svg.axis()
            .scale(y)
            .orient("left").tickFormat(d3.format("s"))
            .innerTickSize(-_self.width)
            .outerTickSize(0)
            .tickPadding(10)
            .ticks(_self.height / 20);

        var area = _self.area = d3.svg.area()
            .interpolate("linear")
            .x(function (d) {
                return _self.x(new Date(d["key"]));
            })
            .y0(_self.height)
            .y1(function (d) {
                return _self.y(d["value"]);
            });

        x.domain(d3.extent(_self.targetData, function (d) {
            return new Date(d["key"]);
        }));

        y.domain(d3.extent(_self.targetData, function (d) {
            return d["value"];
        }));

        _self.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + _self.height + ")")
            .call(xAxis);

        _self.svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        _self.targetData.sort(function (a, b) {
            // if (_self.parseDate(b["key"]).getTime() <
            //     _self.parseDate(a["key"]).getTime()) return 1;
            if (new Date(b["key"]).getTime() <
                new Date(a["key"]).getTime()) return 1;
            return -1;
        });

        _self.svg.append("path")
            .datum(_self.targetData)
            .attr("id", "time")
            .attr("d", area)
            .attr("fill", "#9ecae1")
            .attr("fill-opacity", 0.8)
            .attr("stroke", "#9ecae1")
            .attr("stroke-width", "1.5px");


        // brush end
        // _self.brush = d3.svg.brush()
        //     .x(_self.x)
        //     .on("brushend", brushed);
        //
        // _self.svg.append("g")
        //     .attr("class", "brush")
        //     .call(_self.brush)
        //     .selectAll("rect")
        //     .attr("y", -6)
        //     .attr("height", _self.height + 7);
        //
        // function brushed() {
        //
        //     var left = _self.brush.extent()[0];
        //     var right = _self.brush.extent()[1];
        //
        //     _self.handler(left.toISOString(), right.toISOString(), left.getMonth() + 1, right.getMonth() + 1);
        // }

    } else {

        _self.targetData.sort(function (a, b) {
            if (_self.parseDate(b["key"]).getTime() <
                _self.parseDate(a["key"]).getTime()) return 1;
            return -1;
        });

        _self.y.domain(d3.extent(_self.targetData, function (d) {
            return d["value"];
        }));

        _self.yAxis.scale(_self.y);

        _self.svg.select(".y.axis")
            .call(_self.yAxis);

        _self.svg.select("#time")
            .datum(_self.targetData)
            .attr("d", _self.area)
            .attr("fill", "#9ecae1")
            .attr("fill-opacity", 0.8)
            .attr("stroke", "#9ecae1")
            .attr("stroke-width", "1.5px");

    }
}
