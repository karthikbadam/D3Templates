/*
    Input is an object containing parentId, cols, width, height
    Call function @redraw with the actual data as argument
 */
function Bar(options) {

    var _self = this;

    _self.margin = {
        top: 5,
        right: 30,
        bottom: 30,
        left: 50
    };

    _self.parentId = options.parentId;

    _self.cols = options.cols;

    _self.optionsWidth = options.width;

    _self.optionsHeight = options.height;

    _self.width = options.width - _self.margin.left - _self.margin.right;

    _self.actualheight = options.height - _self.margin.top - _self.margin.bottom;

    _self.myFormat = d3.format(',');

    _self.defaultData = null;

}

Bar.prototype.redraw = function (data) {

    var _self = this;

    _self.targetData = data;

    if (_self.defaultData != null) {
        _self.defaultData = data;
    }

    if (d3.select("#" + _self.parentId + "bar").empty()) {

        d3.select("#" + _self.parentId).selectAll("#" + _self.parentId + "div").remove();
        d3.select("#" + _self.parentId).selectAll("#title").remove();

        _self.height = 10000;

        _self.svg = d3.select("#" + _self.parentId).append("div")
            .attr("id", _self.parentId + "div")
            .style("overflow", "scroll")
            .style("width", _self.width + _self.margin.left + _self.margin.right)
            .style("height", _self.actualheight + _self.margin.top + _self.margin.bottom - 15)
            .append("svg")
            .attr("id", _self.parentId + "bar")
            .attr("width", _self.width + _self.margin.left + _self.margin.right - 5)
            .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (_self.margin.left) + "," +
                _self.margin.top + ")");

        _self.x = d3.scale.linear()
            .domain([0, d3.max(_self.targetData, function (d) {
                if (d["key"] != "")
                    return d["value"];

            })])
            .range([0, _self.width]);


        _self.y = d3.scale.ordinal()
            .domain(_self.targetData.map(function (d) {
                if (d["key"] != "")
                    return d["key"];

                return null;
            }))
            .rangeBands([0, _self.height]);

        _self.barH = 24;

        _self.bars = _self.svg.selectAll("g")
            .data(_self.targetData, function name(d) {
                return d["key"];
            })
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(" + _self.margin.left + "," + i * _self.barH + ")";
            });

        _self.bars.append("rect")
            .attr("width", function (d) {
                return _self.x(Math.pow(d["value"], 1));
            })
            .attr("height", _self.barH - 5)
            .attr("fill", "#9ecae1")
            .attr("fill-opacity", 1)
            .style("cursor", "pointer");

        _self.bars.append("text")
            .attr("x", function (d) {
                return 5;
            })
            .attr("y", _self.barH / 3)
            .attr("fill", "#222")
            .attr("fill-opacity", 1)
            .attr("text-anchor", "start")
            .attr("dy", ".35em")
            .text(function (d) {
                return _self.myFormat(Math.round(d["value"]));
            })
            .style("pointer-events", "none");

        _self.svg.selectAll("text.name")
            .data(_self.targetData)
            .enter().append("text")
            .style("width", _self.margin.left)
            .attr("x", _self.margin.left - 5)
            .attr("y", function (d, i) {
                return i * _self.barH + _self.barH / 2;
            })
            .attr("fill", "#222")
            .attr("text-anchor", "end")
            .attr('class', 'name')
            .style('text-overflow', 'ellipsis')
            .style("cursor", "pointer")
            .text(function (d) {
                if (d["key"].length * 3 > _self.margin.left) {
                    return d["key"].substr(0, 12) + "...";
                }
                return d["key"];
            })

    } else {

        var allBars = _self.svg.selectAll("g").data(_self.targetData,
            function name(d) {
                return d["key"];
            });

        allBars.exit().remove();

        _self.x = d3.scale.linear()
            .domain([0, d3.max(_self.targetData, function (d) {
                if (d["key"] != "")
                    return d["value"];

                return 0;
            })])
            .range([0, _self.width]);

        _self.y = d3.scale.ordinal()
            .domain(_self.targetData.map(function (d) {
                return d["key"];
            }))
            .rangeBands([0, _self.height]);

        var rects = allBars.enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(" + _self.margin.left + "," + i * _self.barH + ")";
            });

        rects.append("rect")
            .attr("width", function (d) {
                return _self.x(Math.pow(d["value"], 1));
            })
            .attr("height", _self.barH - 5)
            .attr("fill", "#9ecae1")
            .style("cursor", "pointer");

        rects.append("text")
            .attr("x", function (d) {
                return 5;
            })
            .attr("y", _self.barH / 3)
            .attr("fill", "#222")
            .attr("text-anchor", "start")
            .attr("dy", ".35em")
            .text(function (d) {
                return _self.myFormat(Math.round(d["value"]));
            })
            .style("pointer-events", "none");

        allBars.attr("transform", function (d, i) {
            return "translate(" + _self.margin.left + "," + i * _self.barH + ")";
        });

        allBars.select("rect")
            .attr("width", function (d) {
                return _self.x(Math.pow(d["value"], 1));
            })
            .attr("height", _self.barH - 5)
            .attr("fill", "#9ecae1")
            .attr("fill-opacity", 1)
            .style("cursor", "pointer");

        allBars
            .select("text")
            .attr("x", function (d) {
                return 5;
            })
            .attr("y", _self.barH / 3)
            .attr("fill", "#222")
            .attr("fill-opacity", 1)
            .attr("text-anchor", "start")
            .attr("dy", ".35em")
            .text(function (d) {
                return _self.myFormat(Math.round(d["value"]));
            });


        var allText = _self.svg.selectAll("text.name").data(_self.targetData,
            function name(d) {
                return d["key"];
            });

        allText.exit().remove();
        //allText.exit().attr("fill", "#AAA").transition().duration(500);

        allText.enter().append("text")
            .attr("x", _self.margin.left - 5)
            .attr("y", function (d, i) {
                return i * _self.barH + _self.barH / 2;
            })
            .attr("fill", "#222")
            .attr("text-anchor", "end")
            .style("cursor", "pointer")
            .text(function (d) {
                if (d["key"].length * 3 > _self.margin.left) {
                    return d["key"].substr(0, 12) + "...";
                }

                return d["key"];
            });

        allText
            .attr("x", _self.margin.left - 5)
            .attr("y", function (d, i) {
                return i * _self.barH + _self.barH / 2;
            })
            .attr("fill", "#222")
            .attr("text-anchor", "end")
            .attr('class', 'name')
            .style("cursor", "pointer")
            .text(function (d) {
                if (d["key"].length * 3 > _self.margin.left) {
                    return d["key"].substr(0, 12) + "...";
                }

                return d["key"];
            });
    }
}
