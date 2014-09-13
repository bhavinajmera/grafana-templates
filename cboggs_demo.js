/* global _ */

/*
URL args:
service           - Currently only used for setting the title of the dashboard
prefix            - (optional) InfluxDB series name prefix, if you use them
hostname          - Regex for hosts you want to graph. This uses the InfluxDB query regex syntax in the WHERE clause
                    This shell script assumes you have a series named allHosts that contains all the hostnames you might
                    want to see
template          - What graphs do you want to see? Template scripts should return a single function that is named 
                    the same as the template file itself, sans '.js'. Said function should return a valid array of
                    Grafana panels. This function currently needs to accept a hostname (regex), prefix, and aggregate
                    boolean. Template scripts can live most anywhere inside $GRAFANA_HOME except /app/dashboards/.  
agg [true|false]  - True will attempt to show aggregate values across all regex-matched hosts, false will generate a
                    row per hostname containing the appropriate panels
from              - Start of time window
*/

'use strict';

// accessable variables in this scope
var window, document, ARGS, $, jQuery, moment, kbn;

function find_hostnames(query) {
    var search_url = window.location.protocol + '//influxdb:8086/db/testdb/series?u=testuser&p=testpw&q=' + query;
    var results = [];
    var request = new XMLHttpRequest();
    request.open('GET', search_url, false);
    request.send(null);
    var obj = JSON.parse(request.responseText);

    for (var i = 0; i < obj[0]["points"].length; i++) {
        results.push(obj[0]["points"][i][1]);
    };

    return results.sort();
};

return function(callback) {

    // Setup some variables
    var dashboard, timspan, panels;

    var rowHeight = '200px';
    var argHostname = (ARGS.host || 'bogus.foo.doman');
    var argPrefix = (ARGS.prefix || '');
    var argService = (ARGS.service || 'Bogus');
    var argTemplate = (ARGS.template || 'foo_template.js');
    var argAggregate;

    if (!_.isUndefined(ARGS.agg) && ARGS.agg === "true") {
        argAggregate = true;
    } else {
        argAggregate = false;
    }

    // Set a default timespan if one isn't specified
    timspan = '1d';

    // Intialize a skeleton with nothing but a rows array and service object
    dashboard = {
        rows: [],
        services: {}
    };

    // Set a title
    dashboard.title = argAggregate ? argService + ' Aggregate' : argService;

    dashboard.services.filter = {
        time: {
            from: "now-" + (ARGS.from || timspan),
            to: "now"
        }
    };

    $("head").append('<script type="text/javascript" src="/' + argTemplate + '.js"></script>');

    $.ajax({
        method: 'GET',
        url: '/'
    })
        .done(function(result) {
            if (argAggregate) {
                dashboard.rows.push({
                    title: argHostname.split(".")[0],
                    height: rowHeight,
                    panels: window[argTemplate](argHostname, argPrefix, argAggregate),
                });
            } else {
                var hosts = find_hostnames('select distinct(hostname) from allHosts where hostname =~ /' + argHostname + '/');
                console.log(hosts.length);

                for (var i = 0; i < hosts.length; i++) {
                    dashboard.rows.push({
                        title: 'Chart',
                        height: rowHeight,
                        panels: window[argTemplate](hosts[i], argPrefix, argAggregate, i + 1),
                    });
                }
            }

            // when dashboard is composed call the callback
            // function and pass the dashboard
            // console.log(dashboard);
            callback(dashboard);

        });
}
