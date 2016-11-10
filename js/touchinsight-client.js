// Crime
var crimeMeta = {};
crimeMeta["id"] = "id";
crimeMeta["date"] = "CrimeDate";
crimeMeta["code"] = "CrimeCode";
crimeMeta["time"] = "CrimeTime";
crimeMeta["location"] = "Location";
crimeMeta["description"] = "Description";
crimeMeta["weapon"] = "Weapon";
crimeMeta["post"] = "Post";
crimeMeta["district"] = "District";
crimeMeta["neighborhood"] = "Neighborhood";
crimeMeta["lat"] = "Latitude";
crimeMeta["lon"] = "Longitude";


var crimeMargins = {};
crimeMargins[crimeMeta["id"]] = 30;
crimeMargins[crimeMeta["date"]] = 70;
crimeMargins[crimeMeta["code"]] = 50;
crimeMargins[crimeMeta["time"]] = 50;
crimeMargins[crimeMeta["location"]] = 100;
crimeMargins[crimeMeta["description"]] = 100;
crimeMargins[crimeMeta["weapon"]] = 80;
crimeMargins[crimeMeta["post"]] = 30;
crimeMargins[crimeMeta["district"]] = 80;
crimeMargins[crimeMeta["neighborhood"]] = 100;
crimeMargins[crimeMeta["lat"]] = 50;
crimeMargins[crimeMeta["lon"]] = 50;


var month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var isNumeric = null;

var numViews = 25;

var visuals = [
    ['Latitude', 'Longitude'],
    ['Description'],
    ['Neighborhood'],
    ['Weapon'],
    ['District'],
    ['CrimeCode'],
    ['CrimeCode', 'Description'],
    ['CrimeCode', 'Neighborhood'],
    ['CrimeCode', 'Weapon'],
    ['CrimeCode', 'District'],
    ['Post'],
    ['Post', 'Description'],
    ['Post', 'Neighborhood'],
    ['Post', 'Weapon'],
    ['Post', 'District'],
    ['Weapon'],
    ['Weapon', 'Description'],
    ['Weapon', 'Neighborhood'],
    ['Weapon', 'Weapon'],
    ['Weapon', 'District'],
    ['Description'],
    ['Description', 'Description'],
    ['Description', 'Neighborhood'],
    ['Description', 'Weapon'],
    ['Description', 'District'],
];

var visualizations = new Array(visuals.length);

var width = 0;

var height = 0;

var crossfilterData = null;

$(document).ready(function () {

    //creating the layout
    width = $("body").width();
    height = $("body").height();

    visuals.forEach(function (d, i) {
        visualizations[i] = null;
    });

    var gridster = $(".gridster").gridster({
        widget_margins: [3, 3],
        min_cols: 3,
        autogrow_cols: true,
        resize: {
            enabled: true
        },
        widget_base_dimensions: [width / 5 - 7, height / 5 - 5],
        autogenerate_stylesheet: true
    }).data('gridster');

    for (var i = 0; i < numViews; i++) {
        if (i == Math.floor(numViews / 2)) {
            gridster.add_widget('<div id = "viz' + i + '" ' +
                'class="panel"></div>', 1, 1);
        } else {
            gridster.add_widget('<div id = "viz' + i + '" ' +
                'class="panel"></div>', 1, 1);
        }
    }

    getDatafromQuery("empty");

    var options = {};

    options.callback = function (query, time, hostDevice) {

        console.log("Synced");
    }

});

function getDatafromQuery(queryList) {

    d3.csv("/data/baltimore-crime.csv", function (data) {

        handleDatafromQuery(data);

    });

    // $.ajax({
    //
    //     type: "GET",
    //     url: "/getCrime",
    //     data: {
    //         data: queryList
    //     }
    //
    // }).done(function (data) {
    //
    //     handleDatafromQuery(data);
    //
    // });
}

function handleDatafromQuery(data) {

    console.log(data);

    if (isNumeric == null) {

        var allKeys = Object.keys(crimeMeta);

        isNumeric = {};

        for (var i = 0; i < data.length; i++) {

            var d = data[i];

            d["Latitude"] = parseFloat(d["Latitude"]);
            d["Longitude"] = parseFloat(d["Longitude"]);

            for (var j = 0; j < allKeys.length; j++) {

                var key = crimeMeta[allKeys[j]];

                var value = data[i][key];

                if (value == "" || value == "NaN" || value == "undefined") {

                    continue;

                } else {

                    isNumeric[key] = $.isNumeric(value);

                }
            }
        }
    }

    crossfilterData = crossfilter(data);

    visuals.forEach(function (d, i) {

        if (d.length == 1) {

            var aggregates = crossfilterData.dimension(function (datum) {
                return datum[d[0]];
            });

            var groupByParty = aggregates.group();

            // groupByParty.top(Infinity).forEach(function(p, i) {
            //     console.log(p.key + ": " + p.value);
            // });

            var processed = groupByParty.top(Infinity);

            if (visualizations[i] == null) {

                if (d[0].indexOf("Date") > -1) {

                    visualizations[i] = new LineChart({
                        parentId: "viz" + i,
                        cols: [d[0]],
                        width: $("#viz" + i).width(),
                        height: $("#viz" + i).height(),
                        text: "Crime Count by " + d[0]
                    });

                    visualizations[i].redraw(processed);

                } else {

                    visualizations[i] = new Bar({
                        parentId: "viz" + i,
                        cols: [d[0]],
                        width: $("#viz" + i).width(),
                        height: $("#viz" + i).height()
                    });

                    visualizations[i].redraw(processed);
                }

            } else {
                visualizations[i].redraw(processed);
            }
        } else {

            var processed = processData(data, d[0], d[1]);

            var aggregates = crossfilterData.dimension(function (datum) {
                var key = {};
                key[d[0]] = datum[d[0]];
                key[d[1]] = datum[d[1]];
                return JSON.stringify(key);
            });

            var groupByParty = aggregates.group();

            groupByParty.top(Infinity).forEach(function (p, i) {
                console.log(p.key + ": " + p.value);
            });

            var processedTemp = groupByParty.top(Infinity);

            var processed = [];

            processedTemp.forEach(function (datum) {
                var key = JSON.parse(datum.key);
                if (key[d[0]] != null && key[d[1]] != null) {
                    processed.push({
                        key: key,
                        value: datum.value
                    });
                }

            });

            if (visualizations[i] == null) {


                //if (d[0].indexOf("Latitude") > -1) {

                    visualizations[i] = new Scatter({
                        parentId: "viz" + i,
                        cols: [d[0], d[1]],
                        width: $("#viz" + i).width(),
                        height: $("#viz" + i).height(),
                        text: "Crime Count by " + d[0],

                    });

                    visualizations[i].redraw(processed);
                //}


            } else {

                visualizations[i].redraw(processed);

            }

        }
    });

}


function processData(data, col1, col2) {

    var newData = {};

    var keyIDs = {};

    data.forEach(function (d, i) {

        var key = d[col1];

        // if has dates
        if (col1.indexOf("Date") > -1) {
            var cdate = new Date(d[col1]);
            var cyear = cdate.getFullYear();
            var cmonth = month_names_short[cdate.getMonth()];

            key = cmonth + "/" + cyear;
        }

        if (col2) {
            var tempkey = key;
            key = {};
            key[col1] = tempkey;
            key[col2] = d[col2];
            key = JSON.stringify(key);
        }

        if (key in newData) {
            //count -- can be automated!!!
            newData[key]++;
            keyIDs[key].push(i);

        } else {
            newData[key] = 1;
            keyIDs[key] = [];
            keyIDs[key].push(i);
        }
    });

    var returnData = [];

    Object.keys(newData).forEach(function (k) {

        var datum = {};
        if (col2) {
            datum["key"] = JSON.parse(k);
        } else {
            datum["key"] = k;
        }
        datum["value"] = newData[k];
        datum["ids"] = keyIDs[k];

        returnData.push(datum);

    });


    // returnData.sort(function (a, b) {
    //     if (a["value"] <
    //         b["value"]) return 1;
    //     return -1;
    // });

    console.log(returnData);
    return returnData;
}

function average(arr) {
    return arr.reduce(function (memo, num) {
            return memo + num;
        }, 0) / arr.length;
}